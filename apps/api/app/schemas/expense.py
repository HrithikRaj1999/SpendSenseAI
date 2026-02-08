from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import uuid

# --- Shared ---
PaymentMethod = Literal["UPI", "Card", "NetBanking", "Cash"]
Timeframe = Literal["month", "quarter", "year", "custom"]

class ExpenseBase(BaseModel):
    title: str
    category: str
    amount: float
    date: datetime
    payment_method: Optional[str] = "UPI" # Should match PaymentMethod ideally but string for flexibility
    
    description: Optional[str] = None
    merchant: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None # Allow string for flexible parsing if needed, but preferably datetime
    payment_method: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None

class Expense(ExpenseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ExpensesDTO(BaseModel):
    rows: List[Expense]
    total: int

class DeleteResult(BaseModel):
    ok: bool
    deleted: int

class RestoreResult(BaseModel):
    ok: bool
    restored: int

class HardDeleteResult(BaseModel):
    ok: bool
    removed: int

class BulkUpdateResult(BaseModel):
    ok: bool
    updated: int

# --- Arguments for GET /expenses (handled via Query params, but useful to have typing) ---
# ... (Usually just function arguments in FastAPI)
