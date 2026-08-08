export type UserRole = 'user' | 'admin';

export interface AdminUserResponse {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_deleted: boolean;
  region?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListResponse {
  total: number;
  users: AdminUserResponse[];
}

export interface AdminSystemStatus {
  total_users: number;
  active_users: number;
  total_predictions: number;
  total_routes: number;
  total_notifications: number;
  database_status: string;
  redis_status: string;
}

export interface JobResponse {
  id: string;
  name: string;
  next_run_time: string | null;
}

export interface SystemJobsResponse {
  total_jobs: number;
  jobs: JobResponse[];
}

export interface CacheRefreshRequest {
  namespace: string;
}

export interface CacheOperationResponse {
  message: string;
  keys_affected: number | null;
}

export interface AnalyticsDailyUsage {
  date: string;
  predictions: number;
  routes: number;
}

export interface AnalyticsCityUsage {
  city_name: string;
  count: number;
}

export interface AdminAnalyticsResponse {
  daily_usage: AnalyticsDailyUsage[];
  top_cities: AnalyticsCityUsage[];
}

export interface ApiLogResponse {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  client_ip: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface ApiLogListResponse {
  total: number;
  logs: ApiLogResponse[];
}

export interface AdminNotificationLogResponse {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminNotificationLogListResponse {
  total: number;
  notifications: AdminNotificationLogResponse[];
}

export interface AdminHealthProfileResponse {
  primary_condition: string;
  has_asthma: boolean;
  has_copd: boolean;
  has_heart_disease: boolean;
  is_elderly: boolean;
  is_pregnant: boolean;
  is_child: boolean;
}

export interface AdminExposureHistoryResponse {
  daily_avg_aqi: number;
  peak_aqi: number;
  total_duration_outdoors_min: number;
  cumulative_pm25: number;
  created_at: string;
}

export interface AdminRouteSummaryResponse {
  id: string;
  start_address: string | null;
  end_address: string | null;
  total_distance_km: number;
  created_at: string;
}

export interface AdminUserDetailsResponse {
  user: AdminUserResponse;
  health_profile: AdminHealthProfileResponse | null;
  recent_exposures: AdminExposureHistoryResponse[];
  recent_routes: AdminRouteSummaryResponse[];
}

export interface AdminHealthAdvisoryTemplateResponse {
  id: string;
  aqi_category: string;
  min_aqi: number;
  max_aqi: number;
  general_advice: string;
  sensitive_group_advice: string;
  created_at: string;
  updated_at: string;
}

export interface AdminHealthAdvisoryTemplateUpdate {
  general_advice?: string;
  sensitive_group_advice?: string;
}
