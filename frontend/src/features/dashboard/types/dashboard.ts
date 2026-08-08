// ─── Backend Response Types (matching FastAPI schemas exactly) ───────────────

export interface AQILiveResponse {
  aqi: number;
  city: string;
  station_lat?: number;
  station_lon?: number;
  dominant_pollutant?: string;
  pollutants: Record<string, any>;
  category: string;
  timestamp: string;
}

export interface GeocodeResponse {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface AutocompleteSuggestion {
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

export interface ReverseGeocodeResponse {
  address: string;
  city?: string;
}

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  visibility?: number;
  cloud_coverage: number;
  rainfall?: number;
  description: string;
  location_name?: string;
}

export interface WeatherForecastPoint {
  time: string;
  temp: number;
  weather: string;
}

export interface AQIForecastPoint {
  time: string;
  aqi: number;
}

export interface DailyForecastResponse {
  weather: WeatherForecastPoint[];
  aqi: AQIForecastPoint[];
}

export interface DashboardCards {
  current_aqi: number;
  latest_aqi_category: string;
  latest_prediction: number;
  average_predicted_aqi: number;
  today_predictions_count: number;
  this_week_predictions_count: number;
  this_month_predictions_count: number;
  total_routes: number;
  favorite_routes_count: number;
  average_exposure_score: number;
  average_smart_route_score: number;
  highest_aqi_encountered: number;
  lowest_aqi_encountered: number;
}

export interface ExposureAnalytics {
  daily_exposure: number;
  weekly_exposure: number;
  monthly_exposure: number;
  yearly_exposure: number;
  average_exposure_score: number;
  highest_exposure: number;
  lowest_exposure: number;
  most_polluted_day: string | null;
  safest_day: string | null;
  exposure_trend: string;
}

export interface PredictionAnalytics {
  daily_predictions: number;
  weekly_predictions: number;
  monthly_predictions: number;
  prediction_accuracy: number;
  prediction_distribution: Record<string, number>;
  aqi_category_distribution: Record<string, number>;
  average_prediction_latency_ms: number;
}

export interface RouteAnalytics {
  total_routes: number;
  average_travel_time_min: number;
  average_distance_km: number;
  average_smart_route_score: number;
  average_aqi: number;
  average_exposure_score: number;
  preferred_travel_preference: string;
}

export interface HealthAnalytics {
  current_health_profile: string;
  configured_aqi_threshold: number;
  health_risk_distribution: Record<string, number>;
  high_risk_predictions: number;
  critical_exposure_count: number;
}

export interface DashboardMetadata {
  timestamp: string;
  total_records_processed: number;
}

export interface DashboardSummaryResponse {
  metadata: DashboardMetadata;
  cards: DashboardCards | null;
  exposure: ExposureAnalytics | null;
  predictions: PredictionAnalytics | null;
  routes: RouteAnalytics | null;
  health: HealthAnalytics | null;
}

export interface TrendDataPoint {
  timestamp: string;
  average_aqi: number;
  total_exposure: number;
  prediction_count: number;
  travel_distance_km: number;
  travel_time_min: number;
}

export interface ChartDataResponse {
  chart_type: string;
  labels: string[];
  datasets: Array<Record<string, unknown>>;
}

// ─── Frontend-Normalized Types used by UI components ────────────────────────

export interface Prediction {
  id: string;
  city: string;
  predictedAqi: number;
  predictionTime: string;
  confidence: number;
  healthRisk: string;
}

export interface Alert {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  message: string;
  type: 'health' | 'weather' | 'system';
}
