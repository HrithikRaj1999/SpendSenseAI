from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class ExpenseDetails(BaseModel):
    title: str = Field(..., description="Merchant name or transaction title")
    category: str = Field(..., description="Expense category")
    paymentMethod: str = Field(..., description="Payment method used")
    amount: float = Field(..., description="Total amount of the expense")
    currency: str = Field("INR", description="Currency code, defaults to INR")
    date: Optional[str] = Field(None, description="Date of the expense in ISO format")
    merchant: Optional[str] = Field(None, description="Merchant/Store name")
    notes: Optional[str] = Field(None, description="Brief description or notes about the expense")
    description: Optional[str] = Field(None, description="Legacy description field, mapped to notes if needed")

class ExpenseAIResult(BaseModel):
    expense: ExpenseDetails
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    warnings: List[str] = Field(default_factory=list, description="List of warnings or potential issues")
    rawText: Optional[str] = Field(None, description="Raw text extracted for debugging purposes")
