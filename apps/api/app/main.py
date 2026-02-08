from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from app.api.router import api_router
from app.modules.ai_expense_parser.router import router as ai_router
from app.core.middleware import add_cors

app = FastAPI(title="SpendSenseAI API")

add_cors(app)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(api_router)
app.include_router(ai_router, prefix="/ai/expense", tags=["AI Expense Parser"])
