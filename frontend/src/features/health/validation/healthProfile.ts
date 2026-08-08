import { z } from 'zod';

const healthConditionEnum = z.enum(['none', 'asthma', 'copd', 'heart_disease', 'elderly', 'children', 'pregnant']);

export const healthProfileSchema = z.object({
  primary_condition: healthConditionEnum.default('none'),
  has_asthma: z.boolean().default(false),
  has_copd: z.boolean().default(false),
  has_heart_disease: z.boolean().default(false),
  is_elderly: z.boolean().default(false),
  is_pregnant: z.boolean().default(false),
  is_child: z.boolean().default(false),
  
  notif_email: z.boolean().default(true),
  notif_push: z.boolean().default(true),
  notif_sms: z.boolean().default(false),
  notif_daily_summary: z.boolean().default(true),
  notif_health_alerts: z.boolean().default(true),
  notif_route_recommendations: z.boolean().default(true),
  notif_weekly_summary: z.boolean().default(false),
  notif_emergency_only: z.boolean().default(false),
});

export type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;
