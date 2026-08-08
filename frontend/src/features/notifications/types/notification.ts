export type NotificationType = 
  | 'health_alert' 
  | 'route_recommendation' 
  | 'system_alert' 
  | 'daily_summary' 
  | 'weekly_summary' 
  | 'emergency';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
  priority: string;
  health_risk?: string;
  aqi?: number;
  related_prediction_id?: string;
  related_route_id?: string;
}

export interface HealthAdvisoryResponse {
  id: string;
  advisory_text: string;
  risk_level: string;
  created_at: string;
  prediction_id?: string;
  route_id?: string;
}

export interface UserPreferencesRead {
  preferred_language: string;
  preferred_aqi_unit: string;
  preferred_notification_method: string;
  preferred_dashboard_settings: string;
  preferred_theme: string;
  preferred_default_route_type: string;
  travel_preference: string;
  aqi_threshold?: number;
  notif_aqi_alerts: boolean;
}

export interface UserPreferencesUpdate {
  preferred_language?: string;
  preferred_aqi_unit?: string;
  preferred_notification_method?: string;
  preferred_dashboard_settings?: string;
  preferred_theme?: string;
  preferred_default_route_type?: string;
  travel_preference?: 'fastest' | 'safest' | 'balanced';
  aqi_threshold?: number;
  notif_aqi_alerts?: boolean;
}
