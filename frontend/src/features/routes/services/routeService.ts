import { api } from '@/services/api';
import type { 
  RouteRecommendRequest, 
  RouteRecommendResponse, 
  RecommendedRoute,
  RouteHistoryResponse,
  DistanceMatrixRequest,
  DistanceMatrixResponse,
  DirectionsRequest,
  DirectionsResponse
} from '../types/route';

export const routeService = {
  recommendRoutes: async (data: RouteRecommendRequest): Promise<RouteRecommendResponse> => {
    const response = await api.post<RouteRecommendResponse>('/routes/recommend', data);
    return response.data;
  },

  selectRoute: async (route: RecommendedRoute): Promise<RecommendedRoute> => {
    const response = await api.post<RecommendedRoute>('/routes/select', route);
    return response.data;
  },

  getRouteHistory: async (): Promise<RouteHistoryResponse[]> => {
    const response = await api.get<RouteHistoryResponse[]>('/routes/history');
    return response.data;
  },

  getRouteDetails: async (routeId: string): Promise<RouteHistoryResponse> => {
    const response = await api.get<RouteHistoryResponse>(`/routes/history/${routeId}`);
    return response.data;
  },

  getDistanceMatrix: async (data: DistanceMatrixRequest): Promise<DistanceMatrixResponse> => {
    const response = await api.post<DistanceMatrixResponse>('/maps/distance-matrix', data);
    return response.data;
  },

  getDirections: async (data: DirectionsRequest): Promise<DirectionsResponse> => {
    const response = await api.post<DirectionsResponse>('/maps/directions', data);
    return response.data;
  }
};
