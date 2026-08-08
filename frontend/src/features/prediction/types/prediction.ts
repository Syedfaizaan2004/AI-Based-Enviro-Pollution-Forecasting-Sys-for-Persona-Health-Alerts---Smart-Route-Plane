export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Hazardous';
export type HealthCondition = 'none' | 'asthma' | 'copd' | 'heart_disease' | 'elderly' | 'children' | 'pregnant';

export interface PredictionRequest {
  latitude: number;
  longitude: number;
  prediction_time: string;
  city?: string;
  health_condition?: HealthCondition;
}

export interface PredictionResponse {
  predicted_aqi: number;
  aqi_category: AQICategory;
  catboost_prediction: number;
  lightgbm_prediction: number;
  xgboost_prediction: number;
  ensemble_prediction: number;
  confidence_score: number;
  prediction_latency_ms: number;
  model_version: string;
  ensemble_version: string;
  prediction_timestamp: string;
  prediction_source: string;
  health_risk_level: string;
  pm25: number;
  pm10: number;
  so2?: number;
  no2?: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
}
