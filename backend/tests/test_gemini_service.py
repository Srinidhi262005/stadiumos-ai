import unittest

from backend.services.gemini_service import GeminiService


class GeminiServiceTests(unittest.TestCase):
    def test_contextual_fallback_recommends_dispatch_for_critical_incident(self):
        service = GeminiService()
        payload = {
            "category": "Security",
            "severity": "critical",
            "zone": "Gate A",
            "crowd_impact": "High",
        }

        result = service.build_contextual_fallback(payload, "incident")

        self.assertEqual(result["priority"], "high")
        self.assertIn("Gate A", result["summary"])
        self.assertGreaterEqual(len(result["recommended_actions"]), 2)


if __name__ == "__main__":
    unittest.main()
