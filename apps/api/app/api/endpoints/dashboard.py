from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from datetime import datetime
import calendar
from typing import List

from app.db.base import get_db
from app.models.expense import Expense as ExpenseModel
from app.models.budget import Budget as BudgetModel
from app.schemas.dashboard import (
    DashboardDTO, DashboardSummary, TrendPoint, CategorySpend, RecentExpense
)

router = APIRouter()

@router.get("", response_model=DashboardDTO)
def get_dashboard(
    month: str = Query(..., regex="^\d{4}-\d{2}$"), # YYYY-MM
    db: Session = Depends(get_db)
):
    # Parse dates
    y, m = map(int, month.split("-"))
    start_dt = datetime(y, m, 1)
    if m == 12:
        end_dt = datetime(y + 1, 1, 1)
    else:
        end_dt = datetime(y, m + 1, 1)

    # 1. Summary Stats
    # Month Spend
    month_spend = db.scalar(
        select(func.sum(ExpenseModel.amount))
        .where(
            ExpenseModel.date >= start_dt, 
            ExpenseModel.date < end_dt,
            ExpenseModel.deleted_at.is_(None)
        )
    ) or 0.0

    # Month Budget
    budget = db.scalar(select(BudgetModel).where(BudgetModel.month == month))
    month_budget = float(budget.total_limit) if budget else 0.0
    
    savings_estimate = month_budget - month_spend

    # Biggest Category
    biggest_cat = db.execute(
        select(ExpenseModel.category, func.sum(ExpenseModel.amount).label("total"))
        .where(
            ExpenseModel.date >= start_dt, 
            ExpenseModel.date < end_dt,
            ExpenseModel.deleted_at.is_(None)
        )
        .group_by(ExpenseModel.category)
        .order_by(desc("total"))
        .limit(1)
    ).first()
    
    biggest_category_name = biggest_cat[0] if biggest_cat else "None"

    summary = DashboardSummary(
        monthSpend=month_spend,
        monthBudget=month_budget,
        savingsEstimate=savings_estimate,
        biggestCategory=biggest_category_name
    )

    # 2. Trend (Daily aggregation)
    # SQLite/Postgres difference in date truncation. 
    # For MVP portability (assuming Postgres env but local testing might use SQLite), 
    # we can fetch all rows and aggregate in Python if volume is low, OR use func.date_trunc('day', ...)
    # Let's do Python aggregation for safety across DBs for this specific query unless performance is critical.
    
    expenses_in_month = db.scalars(
        select(ExpenseModel)
        .where(
            ExpenseModel.date >= start_dt, 
            ExpenseModel.date < end_dt,
            ExpenseModel.deleted_at.is_(None)
        )
        .order_by(ExpenseModel.date)
    ).all()

    daily_map = {}
    for e in expenses_in_month:
        day_str = e.date.strftime("%Y-%m-%d")
        daily_map[day_str] = daily_map.get(day_str, 0.0) + float(e.amount)
        
    trend = [
        TrendPoint(date=d, amount=amt) 
        for d, amt in sorted(daily_map.items())
    ]

    # 3. Categories
    cat_map = {}
    for e in expenses_in_month:
        cat = e.category
        cat_map[cat] = cat_map.get(cat, 0.0) + float(e.amount)
        
    categories = [
        CategorySpend(id=cat, name=cat, amount=amt)
        for cat, amt in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    ]

    # 4. Recent Expenses (limit 5)
    recent_rows = db.scalars(
        select(ExpenseModel)
        .where(ExpenseModel.deleted_at.is_(None)) # Recent global or recent in month? Typically global most recent.
        .order_by(desc(ExpenseModel.date))
        .limit(5)
    ).all()
    
    recent = [
        RecentExpense(
            id=str(r.id),
            title=r.title,
            category=r.category,
            amount=float(r.amount),
            date=r.date.isoformat(),
            paymentMethod=r.payment_method or "Cash"
        )
        for r in recent_rows
    ]

    return DashboardDTO(
        summary=summary,
        trend=trend,
        categories=categories,
        recent=recent
    )
