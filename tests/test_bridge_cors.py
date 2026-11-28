import http.client
import importlib.util
from pathlib import Path
import tempfile
import threading
import unittest

spec = importlib.util.spec_from_file_location("bridge", Path(__file__).resolve().parents[1] / "tools" / "live_bridge.py")
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)


class CorsTest(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        path = Path(folder.name) / "snapshot.json"
        path.write_text('{"format":"vekaid.live.v1","observed_at":"2025-01-01T00:00:00Z","providers":[],"hardware":{"cpu_percent":41}}', encoding="utf-8")
        self.server = bridge.ThreadingHTTPServer(("127.0.0.1", 0), bridge.make_handler(path, "test-placeholder"))
        self.addCleanup(self.server.server_close)
        worker = threading.Thread(target=self.server.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(self.server.shutdown)

    def request(self, method, headers):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        try:
            connection.request(method, "/v1/snapshot", headers=headers)
            reply = connection.getresponse()
            return reply.status, reply.headers, reply.read()
        finally:
            connection.close()

    def test_preflight_has_no_payload_and_varies_by_request(self):
        headers = {"Origin": bridge.ORIGIN, "Access-Control-Request-Method": "GET",
                   "Access-Control-Request-Headers": "authorization",
                   "Access-Control-Request-Private-Network": "true"}
        status, response, body = self.request("OPTIONS", headers)
        self.assertEqual((status, body), (204, b""))
        self.assertEqual(response["Access-Control-Allow-Origin"], bridge.ORIGIN)
        self.assertEqual(response["Access-Control-Allow-Private-Network"], "true")
        self.assertIn("Access-Control-Request-Headers", response["Vary"])
        self.assertEqual(self.request("OPTIONS", {**headers, "Origin": "null"})[0], 403)
        self.assertEqual(self.request("OPTIONS", {**headers, "Access-Control-Request-Headers": "authorization,x-other"})[0], 403)

    def test_data_requires_valid_bearer(self):
        for headers, status in [
            ({}, 401),
            ({"Origin": bridge.ORIGIN, "Authorization": "Bearer wrong"}, 401),
            ({"Origin": "null", "Authorization": "Bearer test-placeholder"}, 403),
        ]:
            actual, response, body = self.request("GET", headers)
            self.assertEqual((actual, body), (status, b""))
            self.assertEqual(response["Cache-Control"], "no-store")
        status, response, body = self.request("GET", {"Origin": bridge.ORIGIN,
                                                       "Authorization": "Bearer test-placeholder"})
        self.assertEqual(status, 200)
        self.assertIn(b"cpu_percent", body)


if __name__ == "__main__":
    unittest.main()
