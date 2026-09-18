from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="ArogyaAI API",
    description="Backend API for ArogyaAI eVillage System",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        message="ArogyaAI backend is running successfully"
    )
