"""VEKAID read-only snapshot bridge. Loopback only; HTTPS via private proxy.
No provider credentials, shell commands, public upload, or dependency installs.
"""
import argparse
import hmac
import json
import math
import os
import secrets
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ORIGIN = "https://vekaid-t-engine.github.io"
LIMIT = 65536
PROVIDERS = {"claude", "codex", "chatgpt-images", "ollama", "wangp"}
STATES = {"unknown", "process-present", "process-absent", "limited", "available", "busy"}
METRICS = {"cpu_percent": 100, "ram_percent": 100, "gpu_percent": 100,
           "gpu_temperature_c": 150, "vram_percent": 100, "storage_percent": 100}

def timestamp(value):
    if not isinstance(value, str):
        raise ValueError("timestamp")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("timezone")
    return parsed.astimezone(timezone.utc)

def number(value, upper):
    return type(value) in (int, float) and 0 <= value <= upper and math.isfinite(value)

def unique(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate key")
        result[key] = value
    return result

def snapshot(path):
    with path.open("rb") as f:
        raw = f.read(LIMIT + 1)
    if len(raw) > LIMIT:
        raise ValueError("size")
    data = json.loads(raw, object_pairs_hook=unique)
    if not isinstance(data, dict) or data.get("format") != "vekaid.live.v1":
        raise ValueError("format")
    observed = timestamp(data.get("observed_at"))
    if observed > datetime.now(timezone.utc) + timedelta(seconds=60):
        raise ValueError("future observation")
    rows = data.get("providers")
    if not isinstance(rows, list) or len(rows) > 5:
        raise ValueError("providers")
    seen, output = set(), []
    for row in rows:
        if not isinstance(row, dict) or row.get("id") not in PROVIDERS or row.get("state") not in STATES or row["id"] in seen:
            raise ValueError("provider")
        seen.add(row["id"])
        q = row.get("used_percent")
        if q is not None and not number(q, 100):
            raise ValueError("percentage")
        reset = row.get("reset_at")
        try:
            reset = timestamp(reset).isoformat() if reset is not None else None
        except (ValueError, TypeError, OverflowError):
            reset = None
        output.append(dict(id=row["id"], state=row["state"], used_percent=q, reset_at=reset))
    hardware = data.get("hardware")
    hardware = hardware if isinstance(hardware, dict) else {}
    normalized = {k: hardware[k] for k, limit in METRICS.items()
                  if k in hardware and number(hardware[k], limit)}
    for key, part, total, invert in (
        ("vram_percent", "vram_used_mib", "vram_total_mib", False),
        ("storage_percent", "storage_free_bytes", "storage_total_bytes", True),
    ):
        a, b = hardware.get(part), hardware.get(total)
        if number(b, 2**53-1) and b > 0 and number(a, b):
            normalized[key] = round(100 * (1 - a/b if invert else a/b), 1)
    return dict(format="vekaid.live.v1", observed_at=observed.isoformat(),
                providers=output, hardware=normalized)

def make_handler(path, token):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass  # Never log credentials or requests.
        def reply(self, code, data=None, preflight=False):
            payload = b"" if data is None else json.dumps(data, allow_nan=False).encode("utf-8")
            self.send_response(code)
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Request-Private-Network" if self.command == "OPTIONS" else "Origin")
            if self.headers.get("Origin") == ORIGIN:
                self.send_header("Access-Control-Allow-Origin", ORIGIN)
                if preflight:
                    self.send_header("Access-Control-Allow-Methods", "GET")
                    self.send_header("Access-Control-Allow-Headers", "Authorization")
                    if self.headers.get("Access-Control-Request-Private-Network") == "true":
                        self.send_header("Access-Control-Allow-Private-Network", "true")
            self.end_headers()
            if payload:
                self.wfile.write(payload)
        def do_OPTIONS(self):
            if self.path != "/v1/snapshot" or self.headers.get("Origin") != ORIGIN or self.headers.get("Access-Control-Request-Method") != "GET":
                return self.reply(403)
            headers = self.headers.get("Access-Control-Request-Headers", "")
            requested = {name.strip().lower() for name in headers.split(",") if name.strip()}
            if requested - {"authorization"}:
                return self.reply(403)
            self.reply(204, preflight=True)
        def do_GET(self):
            if self.path != "/v1/snapshot":
                return self.reply(404)
            if self.headers.get("Origin") not in (None, ORIGIN):
                return self.reply(403)
            credentials = self.headers.get_all("Authorization", [])
            if len(credentials) != 1:
                return self.reply(401)
            supplied = credentials[0].encode("utf-8")
            if not hmac.compare_digest(supplied, ("Bearer " + token).encode("ascii")):
                return self.reply(401)
            try:
                report = snapshot(path)
            except (OSError, ValueError, TypeError, OverflowError):
                return self.reply(503)
            self.reply(200, report)
        def do_POST(self):
            self.reply(405)
    return Handler

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    token = os.environ.get("VEKAID_BRIDGE_TOKEN") or secrets.token_urlsafe(32)
    if not token.isascii() or not 32 <= len(token) <= 256 or not all(c.isalnum() or c in "_-" for c in token):
        parser.error("Use an ASCII base64url token of at least 32 characters.")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(args.snapshot, token))
    print("VEKAID bridge listening on loopback only. Keep the pairing token private.", flush=True)
    if "VEKAID_BRIDGE_TOKEN" not in os.environ:
        print("Session pairing token:", token, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
