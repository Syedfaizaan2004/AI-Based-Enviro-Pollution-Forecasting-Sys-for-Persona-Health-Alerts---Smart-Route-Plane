from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.ml_service import MLService

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_aqi(
    request: PredictionRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    request.user_id = str(current_user.id) if current_user else None
    service = MLService(db)
    return await service.predict_aqi(request)
