import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services/historyService';
import type { HistoryFilters } from '../types/history';

export const historyKeys = {
  all: ['history'] as const,
  predictions: (filters: HistoryFilters) => [...historyKeys.all, 'predictions', filters] as const,
  routes: (filters: HistoryFilters) => [...historyKeys.all, 'routes', filters] as const,
  exposure: (filters: HistoryFilters) => [...historyKeys.all, 'exposure', filters] as const,
  statistics: () => [...historyKeys.all, 'statistics'] as const,
};

export function usePredictionsHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: historyKeys.predictions(filters),
    queryFn: () => historyService.getPredictions(filters),
  });
}

export function useRoutesHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: historyKeys.routes(filters),
    queryFn: () => historyService.getRoutes(filters),
  });
}

export function useExposureHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: historyKeys.exposure(filters),
    queryFn: () => historyService.getExposure(filters),
  });
}

export function useHistoryStatistics() {
  return useQuery({
    queryKey: historyKeys.statistics(),
    queryFn: () => historyService.getStatistics(),
  });
}

export function useDeletePrediction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => historyService.deletePrediction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

export function useDeleteAllPredictions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => historyService.deleteAllPredictions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => historyService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}

export function useDeleteAllRoutes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => historyService.deleteAllRoutes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}
