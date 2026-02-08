from datetime import datetime
from typing import Optional, Dict, Any, List
from .prompts import ALLOWED_CATEGORIES, ALLOWED_PAYMENT_METHODS

def normalize_amount(amount: Any) -> float:
    if isinstance(amount, (int, float)):
        return float(amount)
    if isinstance(amount, str):
        # Remove currency symbols and commas
        cleaned = amount.replace(",", "").replace("$", "").replace("₹", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    return 0.0

def normalize_date(date_str: Optional[str], default_iso: str) -> str:
    if not date_str:
        return default_iso
    try:
        # Check if it's already ISO
        datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return date_str
    except ValueError:
        # Try parsing other formats if needed, or return default
        # For now, if not ISO, return default
        return default_iso

def normalize_category(category: str) -> str:
    if category in ALLOWED_CATEGORIES:
        return category
    # Simple fuzzy matching or fallback
    for allowed in ALLOWED_CATEGORIES:
        if category.lower() in allowed.lower() or allowed.lower() in category.lower():
            return allowed
    return "Misc"

def normalize_payment_method(method: str) -> str:
    if method in ALLOWED_PAYMENT_METHODS:
        return method
    for allowed in ALLOWED_PAYMENT_METHODS:
        if allowed.lower() in method.lower():
            return allowed
    return "Cash"

def compute_confidence(data: Dict[str, Any]) -> float:
    score = 0.0
    if data.get("amount", 0) > 0:
        score += 0.35
    if data.get("title"):
        score += 0.20
    if data.get("date"):
        score += 0.20
    if data.get("paymentMethod") in ALLOWED_PAYMENT_METHODS:
        score += 0.10
    if data.get("category") in ALLOWED_CATEGORIES:
        score += 0.15
    return min(score, 1.0)
