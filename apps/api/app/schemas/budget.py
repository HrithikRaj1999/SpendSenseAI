from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Literal, Dict
from datetime import datetime
import uuid

BudgetMode = Literal["STRICT", "FLEXIBLE", "SAVINGS"]
CategoryKey = str 
BudgetMonth = str # YYYY-MM
Money = float

# --- Core Attributes ---
class Budget(BaseModel):
    id: uuid.UUID
    month: BudgetMonth
    currency: Literal["INR"] = "INR"
    totalLimit: Money
    mode: BudgetMode
    rolloverUnused: bool
    createdAt: datetime
    updatedAt: datetime
    
    model_config = ConfigDict(from_attributes=True)

class BudgetSummary(BaseModel):
    month: BudgetMonth
    totalLimit: Money
    totalSpent: Money
    remaining: Money
    percentUsed: float
    dailyAllowance: Money
    daysRemaining: int

class CategoryBudget(BaseModel):
    id: str
    month: BudgetMonth
    category: CategoryKey
    limit: Money
    spent: Money
    remaining: Money
    percentUsed: float
    severity: Literal["OK", "WARN", "DANGER"]

class BudgetHealthScore(BaseModel):
    score: int
    label: Literal["Great", "Good", "At Risk", "Critical"]
    reasons: List[str]

class BurnRateForecast(BaseModel):
    projectedRunoutDate: Optional[str] = None
    riskCategory: Optional[CategoryKey] = None
    riskPercent: Optional[float] = None
    note: str

class AiSuggestion(BaseModel):
    id: str
    title: str
    detail: str
    impactINR: Money
    action: Literal["APPLY_REALLOCATE", "TUNE_LIMITS", "ENABLE_GUARDRAIL"]

class AlertRule(BaseModel):
    id: str
    month: BudgetMonth
    scope: Literal["TOTAL", "CATEGORY"]
    category: Optional[CategoryKey] = None
    threshold: int # 50 | 75 | 90 | 100
    channel: Literal["IN_APP", "EMAIL"]
    enabled: bool

class GuardrailRule(BaseModel):
    id: str
    month: BudgetMonth
    type: Literal["CONFIRM_ON_EXCEED", "SOFT_LOCK_ON_EXCEED", "WARN_BEFORE_SPEND", "WEEKLY_CAP"]
    enabled: bool
    value: Optional[float] = None
    category: Optional[CategoryKey] = None

class Goal(BaseModel):
    id: str
    title: str
    targetAmount: Money
    currentAmount: Money
    targetDate: Optional[str] = None
    autoAllocateUnused: bool

class BudgetUsagePoint(BaseModel):
    date: str
    spent: Money
    budgetLine: Money

class OverspendHeatCell(BaseModel):
    day: int
    value: float
    severity: Literal["OK", "WARN", "DANGER"]

class BudgetHistoryMonth(BaseModel):
    month: BudgetMonth
    totalLimit: Money
    totalSpent: Money
    overspent: bool
    healthScore: int

class BudgetDTO(BaseModel):
    budget: Budget
    summary: BudgetSummary
    health: BudgetHealthScore
    forecast: BurnRateForecast
    suggestions: List[AiSuggestion]
    categories: List[CategoryBudget]
    alertRules: List[AlertRule]
    guardrails: List[GuardrailRule]
    goals: List[Goal]
    usageSeries: List[BudgetUsagePoint]
    heatmap: List[OverspendHeatCell]
    history: List[BudgetHistoryMonth]

class CreateBudgetInput(BaseModel):
    month: str
    totalLimit: float
    mode: Optional[BudgetMode] = "STRICT"
    rolloverUnused: Optional[bool] = False

class UpdateBudgetInput(BaseModel):
    totalLimit: Optional[float] = None
    mode: Optional[BudgetMode] = None
    rolloverUnused: Optional[bool] = None

class CloneBudgetInput(BaseModel):
    toMonth: str

class MonthListDTO(BaseModel):
    months: List[str]

# Stubs for sub-resource actions
class UpsertCategoryBudgetInput(BaseModel):
    month: str
    category: str
    limit: float

class ToggleRuleInput(BaseModel):
    id: str
    enabled: bool
