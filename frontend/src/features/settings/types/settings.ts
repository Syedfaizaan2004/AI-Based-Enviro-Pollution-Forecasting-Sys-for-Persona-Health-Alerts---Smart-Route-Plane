export type HealthCondition = 
  | 'none'
  | 'asthma'
  | 'copd'
  | 'heart_disease'
  | 'elderly'
  | 'children'
  | 'pregnant';

export interface UserUpdate {
  username?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

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
