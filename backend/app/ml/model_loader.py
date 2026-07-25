import os
import joblib
import logging
import threading
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class XGBoostBoosterWrapper:
    def __init__(self, booster):
        self.booster = booster

    def predict(self, feature_vector):
        import xgboost as xgb

        return self.booster.predict(xgb.DMatrix(feature_vector))


class ModelLoader:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelLoader, cls).__new__(cls)
                cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self._models: Dict[str, Any] = {}
        self._scaler = None
        self._selected_features: List[str] = []
        self._ensemble_metadata: Dict[str, Any] = {}
        
        self.models_dir = self._resolve_models_dir()
        self._load_all()
        self._initialized = True

    def _resolve_models_dir(self) -> str:
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        project_dir = os.path.dirname(backend_dir)
        candidates = [
            os.environ.get("ML_MODELS_DIR"),
            os.path.join(backend_dir, "models"),
            os.path.join(backend_dir, "backend", "models"),
            os.path.join(project_dir, "models"),
        ]
        expected_file_groups = [
            ("catboost_model.pkl", "catboost_model.cbm"),
            ("lightgbm_model.pkl",),
            ("xgboost_model.pkl", "xgboost_model.json"),
            ("robust_scaler.pkl",),
            ("selected_features.pkl",),
        ]

        existing_candidates = [path for path in candidates if path and os.path.isdir(path)]
        if not existing_candidates:
            fallback_dir = os.path.join(backend_dir, "models")
            logger.error(f"No model directory found. Expected one of: {candidates}")
            return fallback_dir

        return max(
            existing_candidates,
            key=lambda path: sum(
                any(os.path.exists(os.path.join(path, filename)) for filename in group)
                for group in expected_file_groups
            ),
        )

    def _load_pickle(self, filename: str) -> Any:
        filepath = os.path.join(self.models_dir, filename)
        if not os.path.exists(filepath):
            logger.error(f"Model file missing: {filepath}")
            return None
            
        try:
            return joblib.load(filepath)
        except Exception as e:
            logger.error(f"Corrupted model file {filename}: {str(e)}")
            return None

    def _load_first_pickle(self, *filenames: str) -> Any:
        for filename in filenames:
            value = self._load_pickle(filename)
            if value is not None:
                return value
        return None

    def _load_catboost(self) -> Any:
        model = self._load_pickle("catboost_model.pkl")
        if model is not None:
            return model

        filepath = os.path.join(self.models_dir, "catboost_model.cbm")
        if not os.path.exists(filepath):
            logger.error(f"Model file missing: {filepath}")
            return None

        try:
            from catboost import CatBoostRegressor

            model = CatBoostRegressor()
            model.load_model(filepath)
            return model
        except ImportError:
            logger.error("catboost is required to load catboost_model.cbm")
            return None
        except Exception as e:
            logger.error(f"Failed to load catboost_model.cbm: {str(e)}")
            return None

    def _load_xgboost(self) -> Any:
        model = self._load_pickle("xgboost_model.pkl")
        if model is not None:
            return model

        filepath = os.path.join(self.models_dir, "xgboost_model.json")
        if not os.path.exists(filepath):
            logger.error(f"Model file missing: {filepath}")
            return None

        try:
            from xgboost import XGBRegressor

            model = XGBRegressor()
            model.load_model(filepath)
            return model
        except ImportError:
            logger.error("xgboost is required to load xgboost_model.json")
            return None
        except Exception as e:
            logger.warning(f"XGBRegressor failed to load xgboost_model.json: {str(e)}")

        try:
            import xgboost as xgb

            booster = xgb.Booster()
            booster.load_model(filepath)
            return XGBoostBoosterWrapper(booster)
        except Exception as e:
            logger.error(f"Failed to load xgboost_model.json: {str(e)}")
            return None

    def _normalize_ensemble_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(metadata, dict):
            return {}

        normalized = dict(metadata)
        weights = normalized.get("weights")
        if isinstance(weights, dict):
            normalized.setdefault("catboost_weight", weights.get("CatBoost", weights.get("catboost", 0.34)))
            normalized.setdefault("lightgbm_weight", weights.get("LightGBM", weights.get("lightgbm", 0.33)))
            normalized.setdefault("xgboost_weight", weights.get("XGBoost", weights.get("xgboost", 0.33)))

        normalized.setdefault("version", "1.0.0")
        normalized.setdefault("ensemble_version", "v1.0.0_ensemble")
        return normalized

    def _load_all(self):
        with self._lock:
            logger.info("Loading ML models into memory...")
            
            # Load models
            catboost = self._load_catboost()
            lightgbm = self._load_pickle("lightgbm_model.pkl")
            xgboost = self._load_xgboost()
            
            if catboost is not None: self._models["catboost"] = catboost
            if lightgbm is not None: self._models["lightgbm"] = lightgbm
            if xgboost is not None: self._models["xgboost"] = xgboost
            
            # Load Scaler
            self._scaler = self._load_pickle("robust_scaler.pkl")
            
            # Load features and metadata
            self._selected_features = self._load_pickle("selected_features.pkl") or []
            metadata = self._load_first_pickle("ensemble_metadata.pkl", "ensemble_info.pkl") or {}
            self._ensemble_metadata = self._normalize_ensemble_metadata(metadata)
            if not self._selected_features and isinstance(metadata, dict):
                self._selected_features = metadata.get("features") or []
            
            logger.info(f"Loaded {len(self._models)} models successfully.")

    def get_models(self) -> Dict[str, Any]:
        return self._models

    def get_scaler(self) -> Any:
        return self._scaler

    def get_selected_features(self) -> List[str]:
        return self._selected_features

    def get_ensemble_metadata(self) -> Dict[str, Any]:
        return self._ensemble_metadata

# Dependency Injection support
def get_model_loader() -> ModelLoader:
    return ModelLoader()
