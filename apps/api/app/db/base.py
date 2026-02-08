from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from typing import Generator

# Use DATABASE_URL from env or default to local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spendsense.db")

# Accessing a postgres URL might need 'postgresql+psycopg://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
