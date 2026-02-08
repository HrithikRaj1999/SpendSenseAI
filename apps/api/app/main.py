from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from app.api.v1.router import router as v1_router
from app.modules.ai_expense_parser.router import router as ai_router
from app.core.middleware import add_cors

app = FastAPI(title="SpendSenseAI API")

add_cors(app)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(v1_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/ai/expense", tags=["AI Expense Parser"])
