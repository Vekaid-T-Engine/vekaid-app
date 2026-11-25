import importlib.util
import json
import tempfile
import threading
import unittest
from datetime import datetime, timezone
from http.client import HTTPConnection
from pathlib import Path
from http.server import ThreadingHTTPServer

spec = importlib.util.spec_from_file_location("bridge", Path(__file__).resolve().parents[1] / "tools/live_bridge.py")
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / "report.json"
        self.token = "test_" + "a" * 32
        self.report = {"format":"vekaid.live.v1","observed_at":datetime.now(timezone.utc).isoformat(),
                       "providers":[{"id":"codex","state":"process-present","used_percent":None,"private":"never publish"}],
                       "hardware":{"cpu_percent":24,"vram_percent":45,"storage_percent":60,"secret":"never publish"}}
        self.path.write_text(json.dumps(self.report))
        self.server = ThreadingHTTPServer(("127.0.0.1",0),bridge.make_handler(self.path,self.token))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()
    def request(self,method="GET",path="/v1/snapshot",headers=None):
        conn = HTTPConnection("127.0.0.1",self.server.server_port,timeout=3)
        try:
            conn.request(method,path,headers=headers or {})
            res = conn.getresponse()
            return res.status,dict(res.getheaders()),res.read()
        finally:
            conn.close()
    def auth(self):
        return {"Authorization":"Bearer "+self.token,"Origin":bridge.ORIGIN}
    def test_real_file_over_http(self):
        status,headers,raw=self.request(headers=self.auth())
        self.assertEqual(status,200)
        self.assertEqual(headers["Cache-Control"],"no-store")
        self.assertEqual(headers["Access-Control-Allow-Origin"],bridge.ORIGIN)
        data=json.loads(raw)
        self.assertEqual(data["hardware"]["cpu_percent"],24)
        self.assertEqual(data["hardware"]["vram_percent"],45)
        self.assertNotIn(b"never publish",raw)
        self.assertIsNone(data["providers"][0]["used_percent"])
    def test_missing_and_wrong_token(self):
        self.assertEqual(self.request()[0],401)
        self.assertEqual(self.request(headers={"Authorization":"Bearer wrong"})[0],401)
    def test_foreign_origin(self):
        h=self.auth();h["Origin"]="https://other.example"
        self.assertEqual(self.request(headers=h)[0],403)
    def test_preflight(self):
        h={"Origin":bridge.ORIGIN,"Access-Control-Request-Method":"GET","Access-Control-Request-Headers":"authorization"}
        self.assertEqual(self.request("OPTIONS",headers=h)[0],204)
        h["Origin"]="https://other.example"
        self.assertEqual(self.request("OPTIONS",headers=h)[0],403)
    def test_no_commands_or_path_traversal(self):
        self.assertEqual(self.request("POST",headers=self.auth())[0],405)
        self.assertEqual(self.request(path="/../secret",headers=self.auth())[0],404)
    def test_invalid_file_and_duplicate_keys(self):
        self.path.write_text('{"format":"vekaid.live.v1","format":"vekaid.live.v1"}')
        self.assertEqual(self.request(headers=self.auth())[0],503)
        self.path.write_bytes(b"x" * 65537)
        self.assertEqual(self.request(headers=self.auth())[0],503)
    def test_no_observation(self):
        self.path.unlink()
        self.assertEqual(self.request(headers=self.auth())[0],503)
    def test_update(self):
        self.report["hardware"]["cpu_percent"]=73
        self.path.write_text(json.dumps(self.report))
        self.assertEqual(json.loads(self.request(headers=self.auth())[2])["hardware"]["cpu_percent"],73)

    def test_canonical_raw_metrics(self):
        self.report["hardware"] = {"vram_used_mib":1536,"vram_total_mib":6144,"storage_free_bytes":250,"storage_total_bytes":1000}
        self.path.write_text(json.dumps(self.report))
        data=json.loads(self.request(headers=self.auth())[2])
        self.assertEqual(data["hardware"]["vram_percent"],25)
        self.assertEqual(data["hardware"]["storage_percent"],75)
        self.assertNotIn("storage_total_bytes",data["hardware"])

if __name__=="__main__":
    unittest.main()
