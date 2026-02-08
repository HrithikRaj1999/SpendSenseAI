from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, asc, update, delete
from typing import List, Optional, Literal
from datetime import datetime, date
import uuid

from app.db.base import get_db
from app.models.expense import Expense as ExpenseModel
from app.schemas.expense import (
    Expense, ExpenseCreate, ExpenseUpdate, ExpensesDTO,
    DeleteResult, RestoreResult, HardDeleteResult, BulkUpdateResult
)

router = APIRouter()

@router.get("", response_model=ExpensesDTO)
def get_expenses(
    timeframe: str = Query("month"),
    month: Optional[str] = Query(None), # YYYY-MM
    quarter: Optional[str] = Query(None), # YYYY-Q1
    year: Optional[int] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    paymentMethod: Optional[str] = Query(None),
    
    sortField: Optional[str] = Query("date"),
    sortOrder: Optional[str] = Query("desc"),
    
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    
    db: Session = Depends(get_db)
):
    query = select(ExpenseModel).where(ExpenseModel.deleted_at.is_(None))

    # --- Filtering ---
    # Timeframe
    # Note: Simplified date parsing logic. Ideally move to a utility.
    if timeframe == "month" and month:
        try:
            y, m = map(int, month.split("-"))
            start_dt = datetime(y, m, 1)
            if m == 12:
                end_dt = datetime(y + 1, 1, 1)
            else:
                end_dt = datetime(y, m + 1, 1)
            query = query.where(ExpenseModel.date >= start_dt, ExpenseModel.date < end_dt)
        except ValueError:
            pass # Ignore invalid format
    
    elif timeframe == "year" and year:
        start_dt = datetime(year, 1, 1)
        end_dt = datetime(year + 1, 1, 1)
        query = query.where(ExpenseModel.date >= start_dt, ExpenseModel.date < end_dt)
        
    elif timeframe == "custom" and from_date and to_date:
        # Assuming ISO format
        query = query.where(ExpenseModel.date >= from_date, ExpenseModel.date <= to_date)
        
    # Search
    if search:
        query = query.where(ExpenseModel.title.ilike(f"%{search}%"))
        
    # Category
    if category and category != "All":
        query = query.where(ExpenseModel.category == category)
        
    # Payment Method
    if paymentMethod and paymentMethod != "All":
        query = query.where(ExpenseModel.payment_method == paymentMethod)

    # --- Sorting ---
    sort_column = getattr(ExpenseModel, sortField, ExpenseModel.date) # default to date if invalid
    if sortOrder == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
        
    # --- Pagination ---
    # Count total matching query (before limit/offset)
    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0
    
    query = query.offset((page - 1) * limit).limit(limit)
    rows = db.scalars(query).all()
    
    return {"rows": rows, "total": total}

@router.post("", response_model=Expense)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    expense = ExpenseModel(**expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.patch("/{id}", response_model=Expense)
def update_expense(
    id: uuid.UUID, 
    expense_in: ExpenseUpdate, 
    db: Session = Depends(get_db)
):
    expense = db.scalar(select(ExpenseModel).where(ExpenseModel.id == id))
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    update_data = expense_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
        
    db.commit()
    db.refresh(expense)
    return expense

# --- Soft Delete Operations ---

@router.post("/soft-delete", response_model=DeleteResult)
def soft_delete_expenses(ids: List[uuid.UUID] = Body(..., embed=True), db: Session = Depends(get_db)):
    stmt = update(ExpenseModel).where(ExpenseModel.id.in_(ids)).values(deleted_at=datetime.utcnow())
    result = db.execute(stmt)
    db.commit()
    return {"ok": True, "deleted": result.rowcount}

@router.post("/restore", response_model=RestoreResult)
def restore_expenses(ids: List[uuid.UUID] = Body(..., embed=True), db: Session = Depends(get_db)):
    stmt = update(ExpenseModel).where(ExpenseModel.id.in_(ids)).values(deleted_at=None)
    result = db.execute(stmt)
    db.commit()
    return {"ok": True, "restored": result.rowcount}

@router.post("/hard-delete", response_model=HardDeleteResult)
def hard_delete_expenses(ids: List[uuid.UUID] = Body(..., embed=True), db: Session = Depends(get_db)):
    stmt = delete(ExpenseModel).where(ExpenseModel.id.in_(ids))
    result = db.execute(stmt)
    db.commit()
    return {"ok": True, "removed": result.rowcount}

# --- Trash ---
@router.get("/trash", response_model=ExpensesDTO)
def get_trash(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    query = select(ExpenseModel).where(ExpenseModel.deleted_at.is_not(None))
    
    if search:
        query = query.where(ExpenseModel.title.ilike(f"%{search}%"))
        
    query = query.order_by(desc(ExpenseModel.deleted_at))
    
    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0
    
    query = query.offset((page - 1) * limit).limit(limit)
    rows = db.scalars(query).all()
    
    return {"rows": rows, "total": total}

# --- Bulk & Filter Ops (Simplified for now) ---

@router.post("/bulk", response_model=BulkUpdateResult)
def bulk_update(
    ids: List[uuid.UUID],
    patch: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    update_data = patch.model_dump(exclude_unset=True)
    if not update_data:
        return {"ok": True, "updated": 0}
        
    stmt = update(ExpenseModel).where(ExpenseModel.id.in_(ids)).values(**update_data)
    result = db.execute(stmt)
    db.commit()
    return {"ok": True, "updated": result.rowcount}

@router.post("/soft-delete/filter", response_model=DeleteResult)
def soft_delete_by_filter(
    args: dict = Body(...), # Reuse get_expenses logic ideally, but for now simple stub or basic filtering
    excludeIds: Optional[List[uuid.UUID]] = Body(None),
    db: Session = Depends(get_db)
):
    # This requires more complex query building reuse. 
    # For MVP, we might skip full implementation or just support basic month filter.
    # Implementing a naive version for "current month/view" deletions.
    # To do it properly, we should refactor the filtering logic in get_expenses into a reusable function.
    
    # ... Refactor later. returning 0 for now to prevent crash.
    return {"ok": True, "deleted": 0}

@router.post("/bulk-update/filter", response_model=BulkUpdateResult)
def bulk_update_by_filter(
    args: dict = Body(...),
    patch: ExpenseUpdate = Body(...),
    excludeIds: Optional[List[uuid.UUID]] = Body(None),
    db: Session = Depends(get_db)
):
    return {"ok": True, "updated": 0}

