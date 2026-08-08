import { api } from '@/services/api';
import type { 
  PaginatedResponse, 
  PredictionHistoryResponse, 
  ExposureHistoryResponse,
  ExposureStatistics,
  HistoryFilters
} from '../types/history';
import type { RouteHistoryResponse } from '@/features/routes/types/route';

export const historyService = {
  getPredictions: async (filters: HistoryFilters): Promise<PaginatedResponse<PredictionHistoryResponse>> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
      ...(filters.sort_by && { sort_by: filters.sort_by }),
      ...(filters.sort_desc !== undefined && { sort_desc: String(filters.sort_desc) }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date })
    });
    const response = await api.get<PaginatedResponse<PredictionHistoryResponse>>(`/history/predictions?${params}`);
    return response.data;
  },

  getRoutes: async (filters: HistoryFilters): Promise<PaginatedResponse<RouteHistoryResponse>> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
      ...(filters.sort_by && { sort_by: filters.sort_by }),
      ...(filters.sort_desc !== undefined && { sort_desc: String(filters.sort_desc) }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date })
    });
    const response = await api.get<PaginatedResponse<RouteHistoryResponse>>(`/history/routes?${params}`);
    return response.data;
  },

  getExposure: async (filters: HistoryFilters): Promise<PaginatedResponse<ExposureHistoryResponse>> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date })
    });
    const response = await api.get<PaginatedResponse<ExposureHistoryResponse>>(`/history/exposure?${params}`);
    return response.data;
  },

  getStatistics: async (): Promise<ExposureStatistics> => {
    const response = await api.get<ExposureStatistics>('/history/statistics');
    return response.data;
  },
  
  deletePrediction: async (id: string): Promise<void> => {
    await api.delete(`/history/predictions/${id}`);
  },

  deleteAllPredictions: async (): Promise<void> => {
    await api.delete('/history/predictions');
  },
  
  deleteRoute: async (id: string): Promise<void> => {
    await api.delete(`/history/routes/${id}`);
  },

  deleteAllRoutes: async (): Promise<void> => {
    await api.delete('/history/routes');
  }
};
