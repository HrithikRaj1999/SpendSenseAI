from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
from datetime import datetime
from .schemas import ExpenseAIResult
from .service import GeminiExpenseParserService

router = APIRouter()

@router.post("/parse-image", response_model=ExpenseAIResult)
async def parse_expense_image(
    file: UploadFile = File(...),
    timezone: str = Form("UTC"),
    now_iso: Optional[str] = Form(None),
    service: GeminiExpenseParserService = Depends(GeminiExpenseParserService)
):
    """
    Parses an expense receipt image using Gemini Vision API.
    Returns structured data (ExpenseDetails) and a confidence score.
    """
    
    # MIME validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (jpeg, png, webp).")

    # Size validation (approx 10MB limit)
    # file.size is not always available depending on backend, so we read chunks or just read all
    # For MVP, read all and checking len is fine
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 10MB.")

    # Time fallback
    if not now_iso:
        now_iso = datetime.now().isoformat()

    return await service.parse_image(
        file_bytes=contents,
        mime_type=file.content_type,
        now_iso=now_iso,
        timezone=timezone
    )
