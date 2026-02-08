from fastapi import APIRouter
from app.api.endpoints import expenses, budgets, dashboard

api_router = APIRouter()

api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
