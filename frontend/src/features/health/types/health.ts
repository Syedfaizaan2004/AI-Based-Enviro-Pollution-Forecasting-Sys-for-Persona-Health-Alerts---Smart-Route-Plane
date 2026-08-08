export type HealthCondition = 'none' | 'asthma' | 'copd' | 'heart_disease' | 'elderly' | 'children' | 'pregnant';

export interface HealthProfileRead {
  id: string;
  user_id: string;
  primary_condition: HealthCondition;
  has_asthma: boolean;
  has_copd: boolean;
  has_heart_disease: boolean;
  is_elderly: boolean;
  is_pregnant: boolean;
  is_child: boolean;
  
  notif_email: boolean;
  notif_push: boolean;
  notif_sms: boolean;
  notif_daily_summary: boolean;
  notif_health_alerts: boolean;
  notif_route_recommendations: boolean;
  notif_weekly_summary: boolean;
  notif_emergency_only: boolean;
}

export interface HealthProfileUpdate {
  primary_condition?: HealthCondition;
  has_asthma?: boolean;
  has_copd?: boolean;
  has_heart_disease?: boolean;
  is_elderly?: boolean;
  is_pregnant?: boolean;
  is_child?: boolean;
  
  notif_email?: boolean;
  notif_push?: boolean;
  notif_sms?: boolean;
  notif_daily_summary?: boolean;
  notif_health_alerts?: boolean;
  notif_route_recommendations?: boolean;
  notif_weekly_summary?: boolean;
  notif_emergency_only?: boolean;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  notification_type:
    | 'health_alert'
    | 'route_recommendation'
    | 'system_alert'
    | 'daily_summary'
    | 'weekly_summary'
    | 'emergency';
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

// Chart Response from backend
export interface ChartDataResponse {
  chart_type: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

// Minimal Dashboard metrics for the Health Score gauges
export interface ExposureAnalytics {
  daily_exposure: number;
  weekly_exposure: number;
  monthly_exposure: number;
  yearly_exposure: number;
  average_exposure_score: number;
  highest_exposure: number;
  lowest_exposure: number;
  most_polluted_day?: string;
  safest_day?: string;
  exposure_trend: string;
}

export interface HealthAnalytics {
  current_health_profile: string;
  configured_aqi_threshold: number;
  health_risk_distribution: Record<string, number>;
  high_risk_predictions: number;
  critical_exposure_count: number;
}

export interface DashboardSummaryResponse {
  metadata: any;
  cards?: any;
  exposure?: ExposureAnalytics;
  predictions?: any;
  routes?: any;
  health?: HealthAnalytics;
}
