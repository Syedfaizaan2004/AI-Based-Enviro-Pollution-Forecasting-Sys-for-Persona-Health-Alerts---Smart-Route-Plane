export type HealthCondition = 'none' | 'asthma' | 'copd' | 'heart_disease' | 'elderly' | 'children' | 'pregnant';

export interface RouteRecommendRequest {
  source: string;
  destination: string;
  travel_datetime: string;
  health_condition?: HealthCondition;
}

export interface RouteWaypointSchema {
  latitude: number;
  longitude: number;
  predicted_aqi: number;
  aqi_category: string;
  health_risk: string;
  travel_time_from_start_min: number;
  city_name?: string | null;
  temperature?: number | null;
  pm25?: number | null;
}

export interface RouteScoreSchema {
  pollution_score: number;
  exposure_score: number;
  travel_time_score: number;
  health_score: number;
  smart_route_score: number;
  average_aqi: number;
  maximum_aqi: number;
  minimum_aqi: number;
  average_pm25: number;
  average_pm10: number;
  average_temperature: number;
  average_humidity: number;
  average_wind_speed: number;
  is_rainy: boolean;
  prediction_confidence: number;
  aqi_category_distribution: Record<string, number>;
}

export interface RecommendedRoute {
  route_id?: string;
  start_address?: string;
  end_address?: string;
  rank: number;
  recommendation_reason: string;
  health_recommendation_level: string;
  travel_time_min: number;
  distance_km: number;
  scores: RouteScoreSchema;
  waypoints: RouteWaypointSchema[];
  polyline: string;
}

export interface RouteRecommendResponse {
  best_route: RecommendedRoute;
  alternative_routes: RecommendedRoute[];
}

export interface RouteHistoryResponse {
  id: string;
  start_lat: number;
  start_lng: number;
  start_address?: string;
  end_lat: number;
  end_lng: number;
  end_address?: string;
  total_distance_km: number;
  estimated_duration_min: number;
  created_at: string;
  scores?: RouteScoreSchema[] | null;
  waypoints?: RouteWaypointSchema[] | null;
}

export interface DistanceMatrixRequest {
  origins: string;
  destinations: string;
}

export interface DistanceMatrixResponse {
  distance_text: string;
  distance_value: number; // meters
  duration_text: string;
  duration_value: number; // seconds
}

export interface DirectionsRequest {
  source: string;
  destination: string;
}

export interface DirectionsRoute {
  distance_text: string;
  distance_value: number;
  duration_text: string;
  duration_value: number;
  polyline: string;
  waypoints: { lat: number; lng: number }[];
}

export interface DirectionsResponse {
  routes: DirectionsRoute[];
}
