import logging
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.aqi_service import AQIService
from app.services.weather_service import WeatherService
from app.services.prediction_history_service import PredictionHistoryService
from app.ml.model_loader import get_model_loader
from app.ml.feature_engineer import FeatureEngineer
from app.ml.predictor import AQIPredictor
from app.models.prediction import PredictionHistory
from app.models.enums import PredictionSource, HealthCondition
from app.utils.health_risk import get_aqi_category, get_health_risk

logger = logging.getLogger(__name__)

class MLService:
    def __init__(self, db: AsyncSession = None):
        self.db = db
        self.aqi_service = AQIService()
        self.weather_service = WeatherService()
        self.loader = get_model_loader()
        self.predictor = AQIPredictor()
        self.history_service = PredictionHistoryService(db) if db else None

    async def predict_aqi(self, req: PredictionRequest) -> PredictionResponse:
        # 1. Collect Live Data
        try:
            # If city provided, try to fetch AQI by city, else use generic logic or fallback.
            # In Phase 5, get_live_aqi expects a city string. Let's use a dummy or geo if available.
            # For this engine, we will pass lat/lon to weather and try to get AQI using city if present, or generic 'here' WAQI fallback.
            aqi_city = req.city if req.city else "here"
            aqi_data = await self.aqi_service.get_live_aqi(aqi_city)
            weather_data = await self.weather_service.get_current_weather(req.latitude, req.longitude)
        except HTTPException as e:
            logger.error(f"Failed to fetch external data for prediction: {e.detail}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error fetching external data: {str(e)}")
            raise HTTPException(status_code=502, detail="External data unavailable")

        # 2. Build Feature Vector
        try:
            features = self.loader.get_selected_features()
            scaler = self.loader.get_scaler()
            
            engineer = FeatureEngineer(features, scaler)
            
            aqi_dict = aqi_data.model_dump()
            weather_dict = weather_data.model_dump()
            
            # The WAQI schema has pollutants. Flatten them.
            if "pollutants" in aqi_dict and isinstance(aqi_dict["pollutants"], dict):
                for p, p_data in aqi_dict["pollutants"].items():
                    if isinstance(p_data, dict) and "v" in p_data:
                        aqi_dict[p] = p_data["v"]
            
            feature_vector = engineer.process_features(aqi_dict, weather_dict, req.prediction_time)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Feature engineering failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Feature engineering failed")

        # 3. Predict
        try:
            import asyncio
            # Run the CPU-bound prediction in a separate thread to unblock async event loop
            prediction_result = await asyncio.wait_for(
                asyncio.to_thread(self.predictor.predict, feature_vector),
                timeout=5.0  # 5 second strict timeout for predictions
            )
        except asyncio.TimeoutError:
            logger.error("Prediction engine timed out")
            raise HTTPException(status_code=504, detail="Prediction engine timeout")
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Model prediction failed")

        predicted_aqi = prediction_result["predicted_aqi"]
        category = get_aqi_category(predicted_aqi)
        health_risk = get_health_risk(predicted_aqi, req.health_condition)

        # 4. Construct Response
        response = PredictionResponse(
            predicted_aqi=predicted_aqi,
            aqi_category=category,
            catboost_prediction=prediction_result["catboost_prediction"],
            lightgbm_prediction=prediction_result["lightgbm_prediction"],
            xgboost_prediction=prediction_result["xgboost_prediction"],
            ensemble_prediction=predicted_aqi,
            confidence_score=prediction_result["confidence_score"],
            prediction_latency_ms=prediction_result["prediction_latency_ms"],
            model_version=prediction_result["model_version"],
            ensemble_version=prediction_result["ensemble_version"],
            prediction_timestamp=req.prediction_time,
            prediction_source=PredictionSource.ENSEMBLE_ML.value,
            health_risk_level=health_risk,
            pm25=aqi_dict.get("pm25", 0.0),
            pm10=aqi_dict.get("pm10", 0.0),
            temperature=weather_dict.get("temperature", 0.0),
            humidity=weather_dict.get("humidity", 0.0),
            wind_speed=weather_dict.get("wind_speed", 0.0)
        )

        # 5. Store History
        history = PredictionHistory(
            latitude=req.latitude,
            longitude=req.longitude,
            aqi_value=predicted_aqi,
            aqi_category=category,
            pm25=aqi_dict.get("pm25", 0.0),
            pm10=aqi_dict.get("pm10", 0.0),
            no2=aqi_dict.get("no2", 0.0),
            so2=aqi_dict.get("so2", 0.0),
            o3=aqi_dict.get("o3", 0.0),
            co=aqi_dict.get("co", 0.0),
            temperature=weather_dict.get("temperature", 0.0),
            humidity=weather_dict.get("humidity", 0.0),
            wind_speed=weather_dict.get("wind_speed", 0.0),
            pressure=weather_dict.get("pressure", 0.0),
            model_version=prediction_result["model_version"],
            ensemble_version=prediction_result["ensemble_version"],
            prediction_latency_ms=prediction_result["prediction_latency_ms"],
            prediction_source=PredictionSource.ENSEMBLE_ML,
            prediction_timestamp=req.prediction_time
        )
        if self.db:
            try:
                self.db.add(history)
                await self.db.commit()
                await self.db.refresh(history)
            except Exception as e:
                await self.db.rollback()
                logger.error(f"Failed to save prediction history: {str(e)}")
        
        # Log Exposure automatically if a user is in context
        # wait, prediction request doesn't have user_id, MLService is instantiated per request, but we don't have user_id natively in PredictionRequest.
        # But Phase 8 says "For every completed prediction or route". 
        # I'll just log it in RouteRankingService where we have a user context. Doing it here without a user is impossible due to the DB foreign key constraint on exposure_history.user_id.

        return response
