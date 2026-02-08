import os
from google import genai
from google.genai import types
from typing import Optional
from fastapi import UploadFile, HTTPException
from .schemas import ExpenseAIResult, ExpenseDetails
from .prompts import EXPENSE_PARSER_PROMPT, AUDIO_EXPENSE_PARSER_PROMPT, ALLOWED_CATEGORIES, ALLOWED_PAYMENT_METHODS
from .json_guard import extract_json
from .normalizer import normalize_amount, normalize_date, normalize_category, normalize_payment_method, compute_confidence

class GeminiExpenseParserService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def parse_image(self, file_bytes: bytes, mime_type: str, now_iso: str, timezone: str) -> ExpenseAIResult:
        if not self.client:
             raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

        # 1. Build Prompt
        prompt = EXPENSE_PARSER_PROMPT.format(
            categories=", ".join(ALLOWED_CATEGORIES),
            payment_methods=", ".join(ALLOWED_PAYMENT_METHODS),
            now_iso=now_iso,
            timezone=timezone,
            image_type=mime_type
        )

        try:
            # 2. Call Gemini
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=[
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                    prompt
                ]
            )
            
            # 3. Extract JSON
            raw_text = response.text
            data = extract_json(raw_text)
            
            if not data:
                # Retry once logic could go here, for MVP we fail or return empty
                raise ValueError("Failed to extract JSON from Gemini response")

            # 4. Normalize & Validate
            # We create a dictionary with normalized values first
            normalized_data = {
                "title": data.get("title", "Unknown Merchant"),
                "category": normalize_category(data.get("category", "")),
                "paymentMethod": normalize_payment_method(data.get("paymentMethod", "")),
                "amount": normalize_amount(data.get("amount", 0)),
                "currency": data.get("currency", "INR"),
                "date": normalize_date(data.get("date"), now_iso),
                "merchant": data.get("merchant", None),
                "notes": data.get("notes", None),
                "description": data.get("description", "")
            }

            # 5. Compute Confidence
            confidence_score = compute_confidence(normalized_data)
            
            # 6. Warnings
            warnings = []
            if normalized_data["date"] == now_iso and data.get("date") != now_iso:
                warnings.append("Date not found in receipt, used current time.")
            if confidence_score < 0.5:
                warnings.append("Low confidence extraction, please verify carefully.")

            # 7. Construct Result
            expense_details = ExpenseDetails(**normalized_data)
            
            return ExpenseAIResult(
                expense=expense_details,
                confidence=confidence_score,
                warnings=warnings,
                rawText=raw_text # Optional: remove in production if sensitive
            )

        except Exception as e:
            # Log the error
            print(f"Gemini Error: {e}")
            raise HTTPException(status_code=502, detail=f"AI Processing Failed: {str(e)}")

    async def parse_audio(self, file_bytes: bytes, mime_type: str, now_iso: str, timezone: str) -> ExpenseAIResult:
        if not self.client:
             raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

        # 1. Build Prompt
        prompt = AUDIO_EXPENSE_PARSER_PROMPT.format(
            categories=", ".join(ALLOWED_CATEGORIES),
            payment_methods=", ".join(ALLOWED_PAYMENT_METHODS),
            now_iso=now_iso,
            timezone=timezone
        )

        try:
            # 2. Call Gemini
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=[
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                    prompt
                ]
            )
            
            # 3. Extract JSON
            raw_text = response.text
            data = extract_json(raw_text)
            
            if not data:
                raise ValueError("Failed to extract JSON from Gemini response")

            # 4. Normalize & Validate
            normalized_data = {
                "title": data.get("title", "Unknown Expense"),
                "category": normalize_category(data.get("category", "")),
                "paymentMethod": normalize_payment_method(data.get("paymentMethod", "")),
                "amount": normalize_amount(data.get("amount", 0)),
                "currency": data.get("currency", "INR"),
                "date": normalize_date(data.get("date"), now_iso),
                "merchant": data.get("merchant", None),
                "notes": data.get("notes", None),
                "description": data.get("description", "")
            }

            # 5. Compute Confidence
            confidence_score = compute_confidence(normalized_data)
            
            # 6. Warnings
            warnings = []
            if normalized_data["date"] == now_iso and data.get("date") != now_iso:
                warnings.append("Date not found in audio, used current time.")
            if confidence_score < 0.5:
                warnings.append("Low confidence extraction, please verify carefully.")

            # 7. Construct Result
            expense_details = ExpenseDetails(**normalized_data)
            
            return ExpenseAIResult(
                expense=expense_details,
                confidence=confidence_score,
                warnings=warnings,
                rawText=raw_text
            )

        except Exception as e:
            print(f"Gemini Error: {e}")
            raise HTTPException(status_code=502, detail=f"AI Processing Failed: {str(e)}")
