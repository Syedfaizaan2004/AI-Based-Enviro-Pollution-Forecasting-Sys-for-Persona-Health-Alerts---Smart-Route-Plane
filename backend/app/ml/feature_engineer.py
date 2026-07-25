import pandas as pd
import numpy as np
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FeatureEngineer:
    def __init__(self, selected_features: List[str], scaler: Any):
        self.selected_features = selected_features
        self.scaler = scaler
        
    def _create_temporal_features(self, dt: datetime) -> Dict[str, float]:
        return {
            "hour": float(dt.hour),
            "day_of_week": float(dt.weekday()),
            "dayofweek": float(dt.weekday()),
            "Day": float(dt.day),
            "Year": float(dt.year),
            "month": float(dt.month),
            "is_weekend": 1.0 if dt.weekday() >= 5 else 0.0,
            "sin_hour": float(np.sin(2 * np.pi * dt.hour / 24.0)),
            "cos_hour": float(np.cos(2 * np.pi * dt.hour / 24.0)),
            "Hour_sin": float(np.sin(2 * np.pi * dt.hour / 24.0)),
            "Hour_cos": float(np.cos(2 * np.pi * dt.hour / 24.0)),
            "Month_sin": float(np.sin(2 * np.pi * dt.month / 12.0)),
            "Month_cos": float(np.cos(2 * np.pi * dt.month / 12.0)),
            "DayOfWeek_sin": float(np.sin(2 * np.pi * dt.weekday() / 7.0)),
            "DayOfWeek_cos": float(np.cos(2 * np.pi * dt.weekday() / 7.0))
        }

    def _create_training_feature_aliases(self, aqi_data: Dict[str, float], weather_data: Dict[str, float]) -> Dict[str, float]:
        eps = 1e-6
        pm25 = float(aqi_data.get("pm25", 0.0) or 0.0)
        pm10 = float(aqi_data.get("pm10", 0.0) or 0.0)
        no2 = float(aqi_data.get("nitrogen_dioxide", aqi_data.get("no2", 0.0)) or 0.0)
        so2 = float(aqi_data.get("sulfur_dioxide", aqi_data.get("so2", 0.0)) or 0.0)
        o3 = float(aqi_data.get("ozone", aqi_data.get("o3", 0.0)) or 0.0)
        co = float(aqi_data.get("carbon_monoxide", aqi_data.get("co", 0.0)) or 0.0)
        nh3 = float(aqi_data.get("ammonia", aqi_data.get("nh3", 0.0)) or 0.0)
        no = float(aqi_data.get("nitric_oxide", aqi_data.get("no", 0.0)) or 0.0)
        nox = float(aqi_data.get("nitrogen_oxides", aqi_data.get("nox", 0.0)) or 0.0)
        current_aqi = float(aqi_data.get("aqi", 0.0) or 0.0)
        temperature = float(weather_data.get("ambient_temperature", weather_data.get("temperature", 0.0)) or 0.0)
        humidity = float(weather_data.get("relative_humidity", weather_data.get("humidity", 0.0)) or 0.0)
        solar = float(weather_data.get("solar_radiation", 0.0) or 0.0)

        return {
            "pm25": pm25,
            "pm10": pm10,
            "nitrogen_dioxide": no2,
            "sulfur_dioxide": so2,
            "ozone": o3,
            "carbon_monoxide": co,
            "ammonia": nh3,
            "nitric_oxide": no,
            "nitrogen_oxides": nox,
            "ambient_temperature": temperature,
            "relative_humidity": humidity,
            "solar_radiation": solar,
            "rainfall": float(weather_data.get("rainfall", 0.0) or 0.0),
            "PM25_PM10_Ratio": pm25 / (pm10 + eps),
            "O3_NO2_Ratio": o3 / (no2 + eps),
            "NO2_SO2_Ratio": no2 / (so2 + eps),
            "CO_NO2_Ratio": co / (no2 + eps),
            "Temp_Humidity": temperature * humidity,
            "Humidity_Solar": humidity * solar,
            "pm25_ambient_temperature": pm25 * temperature,
            "pm25_relative_humidity": pm25 * humidity,
            "pm10_relative_humidity": pm10 * humidity,
            "sulfur_dioxide_ambient_temperature": so2 * temperature,
            "nitrogen_dioxide_solar_radiation": no2 * solar,
            "calculated_aqi_lag_1": current_aqi,
            "calculated_aqi_lag_24": current_aqi,
            "calculated_aqi_lag_48": current_aqi,
            "calculated_aqi_lag_72": current_aqi,
            "calculated_aqi_expanding_mean": current_aqi,
            "calculated_aqi_rolling_std_3": 0.0,
            "calculated_aqi_rolling_std_6": 0.0,
            "calculated_aqi_rolling_std_12": 0.0,
            "calculated_aqi_rolling_std_24": 0.0,
            "city_encoded": float(aqi_data.get("city_encoded", 0.0) or 0.0),
            "state_encoded": float(aqi_data.get("state_encoded", 0.0) or 0.0),
        }

    def _create_interaction_features(self, aqi_data: Dict[str, float], weather_data: Dict[str, float]) -> Dict[str, float]:
        temp = weather_data.get("temperature", 20.0)
        humid = weather_data.get("humidity", 50.0)
        pm25 = aqi_data.get("pm25", 0.0)
        
        return {
            "temp_humidity_index": temp * (humid / 100.0),
            "pm25_temp_interaction": pm25 * temp
        }

    def _create_derived_features(self, aqi_data: Dict[str, float], weather_data: Dict[str, float]) -> Dict[str, float]:
        return {
            "aqi_pm25_ratio": aqi_data.get("aqi", 0.0) / (aqi_data.get("pm25", 1.0) + 1e-6),
            "wind_chill": weather_data.get("temperature", 20.0) - (0.5 * weather_data.get("wind_speed", 0.0))
        }
        
    def _handle_missing_values(self, features: Dict[str, float]) -> Dict[str, float]:
        # Fill missing with 0 or mean (simplified to 0 here)
        return {k: (v if not pd.isna(v) and v is not None else 0.0) for k, v in features.items()}

    def process_features(self, 
                         aqi_data: Dict[str, float], 
                         weather_data: Dict[str, float], 
                         prediction_time: datetime) -> pd.DataFrame:
        
        # Combine base features
        raw_features = {**aqi_data, **weather_data}
        raw_features.update(self._create_training_feature_aliases(aqi_data, weather_data))
        
        # Add engineered features
        raw_features.update(self._create_temporal_features(prediction_time))
        raw_features.update(self._create_interaction_features(aqi_data, weather_data))
        raw_features.update(self._create_derived_features(aqi_data, weather_data))
        
        # Handle missing
        clean_features = self._handle_missing_values(raw_features)
        
        # Order features exactly as training
        if not self.selected_features:
            # Fallback if no selected_features found
            self.selected_features = list(clean_features.keys())
            
        ordered_vector = []
        for feat in self.selected_features:
            ordered_vector.append(clean_features.get(feat, 0.0))
            
        feature_df = pd.DataFrame([ordered_vector], columns=self.selected_features)
        
        # Scale features
        if self.scaler:
            try:
                scaled_array = self.scaler.transform(feature_df)
                return pd.DataFrame(scaled_array, columns=self.selected_features)
            except Exception as e:
                logger.error(f"Scaling failed: {str(e)}")
                raise ValueError("Feature scaling failed due to invalid features")
        
        return feature_df
