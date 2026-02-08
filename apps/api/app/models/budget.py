import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    month: Mapped[str] = mapped_column(String(7), unique=True, index=True) # YYYY-MM
    currency: Mapped[str] = mapped_column(String(8), default='INR')
    total_limit: Mapped[float] = mapped_column(Numeric(12, 2))
    mode: Mapped[str] = mapped_column(String(50), default='STRICT') # STRICT, FLEXIBLE
    rollover_unused: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
