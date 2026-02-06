from fastapi import FastAPI

from app.api.v1.router import router as v1_router
from app.core.middleware import add_cors

app = FastAPI(title="SpendSenseAI API")

add_cors(app)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(v1_router, prefix="/api/v1")
