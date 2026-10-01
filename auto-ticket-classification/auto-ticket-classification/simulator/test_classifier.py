import csv
import os
import unittest
from classifier import classify

CSV_PATH = os.path.join(os.path.dirname(__file__), "sample_tickets.csv")


class TestClassifier(unittest.TestCase):
    def test_sample_tickets(self):
        with open(CSV_PATH, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                r = classify(row["short_description"], row["description"])
                self.assertEqual(r["category"], row["expected_category"], row["short_description"])
                self.assertEqual(r["assignment_group"], row["expected_group"], row["short_description"])

    def test_escalation_raises_priority(self):
        normal = classify("Wi-Fi not working", "cannot connect")
        urgent = classify("Wi-Fi not working", "cannot connect, exam in progress")
        self.assertLess(urgent["priority"], normal["priority"])

    def test_unknown_goes_to_manual_review(self):
        r = classify("Need a new chair", "")
        self.assertTrue(r["needs_manual_review"])
        self.assertEqual(r["assignment_group"], "Service Desk")


if __name__ == "__main__":
    unittest.main()
