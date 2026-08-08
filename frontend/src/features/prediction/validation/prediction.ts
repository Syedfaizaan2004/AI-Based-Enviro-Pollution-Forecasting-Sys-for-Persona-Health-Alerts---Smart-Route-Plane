import { z } from 'zod';

const healthConditionEnum = z.enum(['none', 'asthma', 'copd', 'heart_disease', 'elderly', 'children', 'pregnant']);

export const predictionFormSchema = z.object({
  city: z.string().min(2, "City name must be at least 2 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  predictionDate: z.string().min(1, "Date is required"),
  predictionTime: z.string().min(1, "Time is required"),
  healthCondition: healthConditionEnum.optional(),
});

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;
