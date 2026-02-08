from pydantic import BaseModel
from typing import List, Literal, Optional

class DashboardSummary(BaseModel):
    monthSpend: float
    monthBudget: float
    savingsEstimate: float
    biggestCategory: str

class TrendPoint(BaseModel):
    date: str # YYYY-MM-DD
    amount: float

class CategorySpend(BaseModel):
    id: str
    name: str
    amount: float

class RecentExpense(BaseModel):
    id: str
    title: str
    category: str
    amount: float
    date: str # ISO
    paymentMethod: str # Normalized to string to match flexible backend model

class DashboardDTO(BaseModel):
    summary: DashboardSummary
    trend: List[TrendPoint]
    categories: List[CategorySpend]
    recent: List[RecentExpense]
