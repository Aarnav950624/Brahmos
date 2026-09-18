from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="ArogyaAI API",
    description="Backend API for ArogyaAI eVillage System",
    version="1.0.0",
)

from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme

app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(wallet.router, prefix="/api/v1/health-wallet", tags=["Health Wallet"])
app.include_router(asha.router, prefix="/api/v1/asha", tags=["ASHA"])
app.include_router(doctor.router, prefix="/api/v1/doctor", tags=["Doctor"])
app.include_router(pharmacy.router, prefix="/api/v1/pharmacy", tags=["Pharmacy"])
app.include_router(lab.router, prefix="/api/v1/lab", tags=["Lab"])
app.include_router(citizen.router, prefix="/api/v1/citizen", tags=["Citizen"])
app.include_router(scheme.router, prefix="/api/v1", tags=["Scheme"])

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
