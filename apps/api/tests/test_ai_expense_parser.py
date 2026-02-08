import unittest
from app.modules.ai_expense_parser.json_guard import extract_json
from app.modules.ai_expense_parser.normalizer import normalize_amount, normalize_date, normalize_category

class TestAiExpenseParser(unittest.TestCase):

    def test_extract_json(self):
        # Case 1: Pure JSON
        text = '{"a": 1}'
        self.assertEqual(extract_json(text), {"a": 1})

        # Case 2: Markdown JSON
        text = '```json\n{"b": 2}\n```'
        self.assertEqual(extract_json(text), {"b": 2})

        # Case 3: Text with JSON
        text = 'Here is the result: {"c": 3} Thanks.'
        self.assertEqual(extract_json(text), {"c": 3})
        
        # Case 4: Invalid
        text = 'No JSON here'
        self.assertIsNone(extract_json(text))

    def test_normalize_amount(self):
        self.assertEqual(normalize_amount(100), 100.0)
        self.assertEqual(normalize_amount("1,234.50"), 1234.5)
        self.assertEqual(normalize_amount("$50.00"), 50.0)
        self.assertEqual(normalize_amount("₹ 500"), 500.0)
        self.assertEqual(normalize_amount("invalid"), 0.0)

    def test_normalize_date(self):
        now = "2023-01-01T12:00:00"
        self.assertEqual(normalize_date("2023-10-27T10:00:00Z", now), "2023-10-27T10:00:00Z")
        self.assertEqual(normalize_date(None, now), now)
        self.assertEqual(normalize_date("not-a-date", now), now)

    def test_normalize_category(self):
        self.assertEqual(normalize_category("Food & Dining"), "Food & Dining")
        self.assertEqual(normalize_category("food"), "Food & Dining")
        self.assertEqual(normalize_category("unknown"), "Misc")

if __name__ == '__main__':
    unittest.main()
