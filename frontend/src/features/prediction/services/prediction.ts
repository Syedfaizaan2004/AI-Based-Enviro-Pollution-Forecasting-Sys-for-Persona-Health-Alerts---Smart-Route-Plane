import { api } from '@/services/api';
import { PREDICTION_ENDPOINTS } from './endpoints';
import type { PredictionRequest, PredictionResponse } from '../types/prediction';

export const predictionService = {
  predictAQI: async (data: PredictionRequest): Promise<PredictionResponse> => {
    const response = await api.post(PREDICTION_ENDPOINTS.PREDICT, data);
    return response.data;
  },
};
