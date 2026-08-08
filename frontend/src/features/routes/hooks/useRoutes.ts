import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { routeService } from '../services/routeService';
import type { RouteRecommendRequest, RecommendedRoute } from '../types/route';

export const routeKeys = {
  all: ['routes'] as const,
  history: () => [...routeKeys.all, 'history'] as const,
  details: (id: string) => [...routeKeys.all, 'history', id] as const,
};

export function useRecommendRoutes() {
  return useMutation({
    mutationFn: (data: RouteRecommendRequest) => routeService.recommendRoutes(data),
  });
}

export function useSelectRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (route: RecommendedRoute) => routeService.selectRoute(route),
    onSuccess: () => {
      // Invalidate route history so the new selection shows up in the user's past routes
      queryClient.invalidateQueries({ queryKey: routeKeys.history() });
    },
  });
}

export function useRouteHistory() {
  return useQuery({
    queryKey: routeKeys.history(),
    queryFn: () => routeService.getRouteHistory(),
  });
}

export function useRouteDetails(routeId: string) {
  return useQuery({
    queryKey: routeKeys.details(routeId),
    queryFn: () => routeService.getRouteDetails(routeId),
    enabled: !!routeId,
  });
}

export function useDistanceMatrix() {
  return useMutation({
    mutationFn: (data: import('../types/route').DistanceMatrixRequest) => routeService.getDistanceMatrix(data),
  });
}

export function useDirections() {
  return useMutation({
    mutationFn: (data: import('../types/route').DirectionsRequest) => routeService.getDirections(data),
  });
}
