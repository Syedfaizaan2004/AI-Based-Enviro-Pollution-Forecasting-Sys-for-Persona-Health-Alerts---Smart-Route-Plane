import { useMutation } from '@tanstack/react-query';
import { predictionService } from '../services/prediction';
import type { PredictionRequest, PredictionResponse } from '../types/prediction';

export const usePredictAQI = () => {
  return useMutation<PredictionResponse, Error, PredictionRequest>({
    mutationFn: (data: PredictionRequest) => predictionService.predictAQI(data),
  });
};
