from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.ml_service import MLService

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_aqi(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    service = MLService(db)
    return await service.predict_aqi(request)
