import time
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any
from app.ml.model_loader import get_model_loader

logger = logging.getLogger(__name__)

class AQIPredictor:
    def __init__(self):
        self.loader = get_model_loader()
        
    def _validate_models(self):
        models = self.loader.get_models()
        if not models or "catboost" not in models or "lightgbm" not in models or "xgboost" not in models:
            logger.error("Models not fully loaded")
            raise RuntimeError("ML Models are missing or failed to load")
            
    def _calculate_confidence(self, preds: np.ndarray) -> float:
        # Simple heuristic: less variance = more confidence
        std = float(np.std(preds))
        mean = float(np.mean(preds))
        if mean == 0:
            return 0.0
        cv = std / mean
        confidence = max(0.0, min(100.0, 100.0 - (cv * 100.0)))
        return round(confidence, 2)

    def predict(self, feature_vector: pd.DataFrame) -> Dict[str, Any]:
        self._validate_models()
        
        start_time = time.time()
        
        models = self.loader.get_models()
        metadata = self.loader.get_ensemble_metadata()
        
        # In a real scikit-learn mock, .predict() returns a 1D array.
        cb_pred = float(models["catboost"].predict(feature_vector)[0])
        lgb_pred = float(models["lightgbm"].predict(feature_vector)[0])
        xgb_pred = float(models["xgboost"].predict(feature_vector)[0])
        
        # Ensemble weights
        cb_weight = metadata.get("catboost_weight", 0.34)
        lgb_weight = metadata.get("lightgbm_weight", 0.33)
        xgb_weight = metadata.get("xgboost_weight", 0.33)
        
        ensemble_pred = (cb_pred * cb_weight) + (lgb_pred * lgb_weight) + (xgb_pred * xgb_weight)
        
        latency = round((time.time() - start_time) * 1000, 2)
        confidence = self._calculate_confidence(np.array([cb_pred, lgb_pred, xgb_pred]))
        
        # Bound predicted AQI
        ensemble_pred = max(0.0, min(500.0, ensemble_pred))
        
        return {
            "predicted_aqi": round(ensemble_pred, 2),
            "catboost_prediction": round(cb_pred, 2),
            "lightgbm_prediction": round(lgb_pred, 2),
            "xgboost_prediction": round(xgb_pred, 2),
            "confidence_score": confidence,
            "prediction_latency_ms": latency,
            "model_version": metadata.get("version", "1.0.0"),
            "ensemble_version": metadata.get("ensemble_version", "v1.0.0_ensemble")
        }
