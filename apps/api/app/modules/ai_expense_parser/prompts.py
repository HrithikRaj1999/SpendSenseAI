ALLOWED_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Health & Wellness",
    "Rent",
    "Groceries",
    "Misc"
]

ALLOWED_PAYMENT_METHODS = [
    "UPI",
    "Card",
    "NetBanking",
    "Cash"
]

EXPENSE_PARSER_PROMPT = """
You are an expert receipt parser. Your job is to extract structured expense data from the provided image.
Return valid JSON only. No markdown formatting, no explanations.

Schema:
{{
  "title": "Merchant Name or Short Title",
  "category": "One of the allowed categories",
  "paymentMethod": "One of the allowed payment methods",
  "amount": 123.45,
  "date": "ISO8601 Date String (YYYY-MM-DDTHH:MM:SSZ)",
  "description": "Short description of items or context"
}}

Rules:
1. **Category**: Must be one of: {categories}. If unsure, choose 'Misc' or 'Shopping'.
2. **Payment Method**: Must be one of: {payment_methods}. Guess from text (e.g. 'UPI', 'Visa', 'Cash'). Default to 'Cash' if unknown.
3. **Amount**: Find the Grand Total / Payable Amount. Must be a number.
4. **Date**: Extract the date and time. Convert to ISO8601 format. If date is not found, leave it null.
5. **Title**: value should be the Merchant Name (e.g. 'Starbucks', 'Uber', 'Zomato'). Keep it short.
6. **Description**: Brief summary (e.g. 'Coffee and snacks', 'Taxi ride'). Max 1-2 sentences.

Context:
- Current Time: {now_iso}
- Timezone: {timezone}

Input Image is a {image_type}.
"""

AUDIO_EXPENSE_PARSER_PROMPT = """
You are an expert expense tracker assistant. Your job is to extract structured expense data from the provided audio file.
Return valid JSON only. No markdown formatting, no explanations.

Schema:
{{
  "title": "Short Title involved in transaction",
  "merchant": "Merchant Name if mentioned",
  "category": "One of the allowed categories",
  "paymentMethod": "One of the allowed payment methods",
  "amount": 123.45,
  "currency": "INR",
  "date": "ISO8601 Date String (YYYY-MM-DD)",
  "notes": "Any other details mentioned"
}}

Rules:
1. **Category**: Must be one of: {categories}. If unsure, choose 'Misc'.
2. **Payment Method**: Must be one of: {payment_methods}. Default to 'Cash' if unknown.
3. **Amount**: Extract the amount. If not mentioned, set to 0.
4. **Date**: Extract the date. Use the current date if 'today' is mentioned. Context provided below.
5. **Merchant**: Extract the merchant name if available.
6. **Notes**: Summarize any other details.
7. **Title**: A short title for the expense (e.g. 'Lunch at Haldiram').

Context:
- Current Time: {now_iso}
- Timezone: {timezone}

Input is an audio file of a user describing an expense.
"""
