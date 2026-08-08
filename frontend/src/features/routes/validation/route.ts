import { z } from 'zod';

const healthConditionEnum = z.enum(['none', 'asthma', 'copd', 'heart_disease', 'elderly', 'children', 'pregnant']);

export const routeSearchSchema = z.object({
  source: z.string().min(2, "Source location is required"),
  destination: z.string().min(2, "Destination location is required"),
  travelDate: z.string(),
  travelTime: z.string(),
  healthCondition: healthConditionEnum,
});

export type RouteSearchValues = z.infer<typeof routeSearchSchema>;
