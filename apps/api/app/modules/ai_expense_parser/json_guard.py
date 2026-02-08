import json
import re
from typing import Any, Dict, Optional

def extract_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Extracts the first valid JSON object from a string.
    Handles markdown code blocks (```json ... ```).
    """
    try:
        # Try processing as pure JSON first
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Look for markdown code blocks
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Look for just the first curly brace pair
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
            
    return None
