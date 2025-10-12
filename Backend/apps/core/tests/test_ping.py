from django.test import TestCase


class PingEndpointTest(TestCase):
    def test_ping_returns_ok_payload(self):
        response = self.client.get("/api/ping/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
