from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import uuid
import calendar
from datetime import datetime, date
from typing import List, Optional

from app.db.base import get_db
from app.models.budget import Budget as BudgetModel
from app.models.expense import Expense as ExpenseModel
from app.schemas.budget import (
    BudgetDTO, CreateBudgetInput, UpdateBudgetInput, CloneBudgetInput, MonthListDTO,
    UpsertCategoryBudgetInput, ToggleRuleInput,
    Budget, BudgetSummary, BudgetHealthScore, BurnRateForecast,
    CategoryBudget, AlertRule, GuardrailRule, Goal,
    BudgetUsagePoint, OverspendHeatCell, BudgetHistoryMonth
)

from sqlalchemy import func

router = APIRouter()

def calculate_budget_dto(budget_model: BudgetModel, db: Session) -> BudgetDTO:
    # --- 1. Basic Budget Info ---
    budget = Budget.model_validate(budget_model)
    
    # --- 2. Calculate Spends ---
    y, m = map(int, budget_model.month.split("-"))
    start_dt = datetime(y, m, 1)
    # Days in month
    _, days_in_month = calendar.monthrange(y, m)
    
    if m == 12:
        next_dt = datetime(y + 1, 1, 1)
    else:
        next_dt = datetime(y, m + 1, 1) # First day of next month
        
    spent = db.scalar(
        select(func.sum(ExpenseModel.amount))
        .where(
            ExpenseModel.date >= start_dt, 
            ExpenseModel.date < next_dt,
            ExpenseModel.deleted_at.is_(None)
        )
    ) or 0.0
    
    remaining = float(budget_model.total_limit) - spent
    percent_used = (spent / float(budget_model.total_limit)) * 100 if budget_model.total_limit > 0 else 0.0
    
    # Time based calcs
    today = datetime.now()
    if today < start_dt:
        days_remaining = days_in_month
    elif today >= next_dt:
        days_remaining = 0
    else:
        days_remaining = days_in_month - today.day
        
    daily_allowance = remaining / days_remaining if days_remaining > 0 else 0.0

    summary = BudgetSummary(
        month=budget_model.month,
        totalLimit=budget_model.total_limit,
        totalSpent=spent,
        remaining=remaining,
        percentUsed=percent_used,
        dailyAllowance=daily_allowance,
        daysRemaining=days_remaining
    )

    # --- 3. Stubs for complex sub-objects ---
    health = BudgetHealthScore(
        score=85, 
        label="Good", 
        reasons=["Spending is within limits", "No category overrun"]
    )
    
    forecast = BurnRateForecast(
        note="You are on track to save this month."
    )
    
    # Empty lists for now - requires real implementation of sub-tables
    categories: List[CategoryBudget] = [] 
    alert_rules: List[AlertRule] = []
    guardrails: List[GuardrailRule] = []
    goals: List[Goal] = []
    usage_series: List[BudgetUsagePoint] = []
    heatmap: List[OverspendHeatCell] = []
    history: List[BudgetHistoryMonth] = []

    return BudgetDTO(
        budget=budget,
        summary=summary,
        health=health,
        forecast=forecast,
        suggestions=[],
        categories=categories,
        alertRules=alert_rules,
        guardrails=guardrails,
        goals=goals,
        usageSeries=usage_series,
        heatmap=heatmap,
        history=history
    )

@router.get("/months", response_model=MonthListDTO)
def get_budget_months(db: Session = Depends(get_db)):
    months = db.scalars(select(BudgetModel.month).order_by(desc(BudgetModel.month))).all()
    return {"months": list(months)}

@router.get("/{month}", response_model=Optional[BudgetDTO])
def get_budget(month: str, db: Session = Depends(get_db)):
    budget = db.scalar(select(BudgetModel).where(BudgetModel.month == month))
    if not budget:
        return None
    return calculate_budget_dto(budget, db)

@router.post("", response_model=BudgetDTO)
def create_budget(input: CreateBudgetInput, db: Session = Depends(get_db)):
    existing = db.scalar(select(BudgetModel).where(BudgetModel.month == input.month))
    if existing:
        raise HTTPException(status_code=400, detail="Budget for this month already exists")
        
    budget = BudgetModel(
        month=input.month,
        total_limit=input.totalLimit,
        mode=input.mode,
        rollover_unused=input.rolloverUnused
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return calculate_budget_dto(budget, db)

@router.patch("/{month}", response_model=BudgetDTO)
def update_budget(month: str, patch: UpdateBudgetInput, db: Session = Depends(get_db)):
    budget = db.scalar(select(BudgetModel).where(BudgetModel.month == month))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    update_data = patch.model_dump(exclude_unset=True)
    if "totalLimit" in update_data:
        budget.total_limit = update_data["totalLimit"]
    if "mode" in update_data:
        budget.mode = update_data["mode"]
    if "rolloverUnused" in update_data:
        budget.rollover_unused = update_data["rolloverUnused"]
        
    db.commit()
    db.refresh(budget)
    return calculate_budget_dto(budget, db)

@router.post("/{month}/clone", response_model=BudgetDTO)
def clone_budget(month: str, input: CloneBudgetInput = Body(...), db: Session = Depends(get_db)):
    source = db.scalar(select(BudgetModel).where(BudgetModel.month == month))
    if not source:
        raise HTTPException(status_code=404, detail="Source budget not found")
        
    existing = db.scalar(select(BudgetModel).where(BudgetModel.month == input.toMonth))
    if existing:
        raise HTTPException(status_code=400, detail="Target budget already exists")
        
    new_budget = BudgetModel(
        month=input.toMonth,
        total_limit=source.total_limit,
        mode=source.mode,
        rollover_unused=source.rollover_unused,
        currency=source.currency
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return calculate_budget_dto(new_budget, db)

@router.post("/{month}/reset", response_model=BudgetDTO)
def reset_budget(month: str, db: Session = Depends(get_db)):
    budget = db.scalar(select(BudgetModel).where(BudgetModel.month == month))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    budget.total_limit = 0
    budget.mode = "STRICT"
    budget.rollover_unused = False
    
    db.commit()
    db.refresh(budget)
    return calculate_budget_dto(budget, db)

# --- Stubs for sub-resources ---

@router.post("/categories")
def upsert_category_limit(input: UpsertCategoryBudgetInput, db: Session = Depends(get_db)):
    # Sub-table implementation skipped for MVP
    return {"id": "stub", "month": input.month, "category": input.category, "limit": input.limit, "spent": 0, "remaining": input.limit, "percentUsed": 0, "severity": "OK"}

@router.post("/alerts/toggle")
def toggle_alert(input: ToggleRuleInput):
    return {"id": input.id, "enabled": input.enabled}

@router.post("/alerts")
def create_alert(body: dict = Body(...)):
    # Stub returns the input as if created
    return {**body, "id": str(uuid.uuid4())}

@router.post("/guardrails/toggle")
def toggle_guardrail(input: ToggleRuleInput):
    return {"id": input.id, "enabled": input.enabled}

@router.post("/guardrails")
def create_guardrail(body: dict = Body(...)):
    return {**body, "id": str(uuid.uuid4())}

@router.post("/goals")
def create_goal(body: dict = Body(...)):
    return {**body, "id": str(uuid.uuid4())}

@router.post("/what-if")
def simulate_what_if(body: dict = Body(...)):
    # Return dummy simulation
    return {
        "id": str(uuid.uuid4()),
        "name": "Simulation",
        "changes": []
    }
