export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page_size: number;
  current_page: number;
}

export interface PredictionHistoryResponse {
  id: string;
  latitude: number;
  longitude: number;
  aqi_value: number;
  aqi_category: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  prediction_timestamp: string;
  prediction_source: string;
  created_at: string;
  city?: string;
}

export interface ExposureHistoryResponse {
  id: string;
  user_id: string;
  daily_avg_aqi: number;
  peak_aqi: number;
  total_duration_outdoors_min: number;
  cumulative_pm25: number;
  created_at: string;
}

export interface ExposureStatistics {
  daily_exposure: number;
  weekly_exposure: number;
  monthly_exposure: number;
  yearly_exposure: number;
  average_aqi: number;
  highest_aqi: number;
  lowest_aqi: number;
  average_travel_time: number;
  average_exposure_score: number;
  average_smart_route_score: number;
  most_polluted_route_id?: string;
  safest_route_id?: string;
}

export interface HistoryFilters {
  page: number;
  size: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_desc?: boolean;
}
