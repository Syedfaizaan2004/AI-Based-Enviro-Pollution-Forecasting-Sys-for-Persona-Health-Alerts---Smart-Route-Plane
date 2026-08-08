import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../services/healthService';
import { openWeatherService } from '../services/openWeatherService';
import type { HealthProfileUpdate } from '../types/health';

export const healthKeys = {
  all: ['health'] as const,
  profile: () => [...healthKeys.all, 'profile'] as const,
  notifications: () => [...healthKeys.all, 'notifications'] as const,
  advisories: () => [...healthKeys.all, 'advisories'] as const,
  summary: () => [...healthKeys.all, 'summary'] as const,
  charts: (type: string) => [...healthKeys.all, 'charts', type] as const,
};

export function useHealthProfile() {
  return useQuery({
    queryKey: healthKeys.profile(),
    queryFn: () => healthService.getProfile(),
  });
}

export function useUpdateHealthProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: HealthProfileUpdate) => healthService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.profile() });
      queryClient.invalidateQueries({ queryKey: healthKeys.summary() }); // Health score might change
    },
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: healthKeys.notifications(),
    queryFn: () => healthService.getUnreadNotifications(),
    refetchInterval: 30000, // Refetch every 30s
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => healthService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.notifications() });
    },
  });
}

export function useLatestAdvisories() {
  return useQuery({
    queryKey: healthKeys.advisories(),
    queryFn: () => healthService.getLatestAdvisories(),
  });
}

export function useHealthSummary() {
  return useQuery({
    queryKey: healthKeys.summary(),
    queryFn: () => healthService.getHealthSummary(),
  });
}

export function useExposureCharts(type: 'line' | 'bar' | 'area') {
  return useQuery({
    queryKey: healthKeys.charts(type),
    queryFn: () => healthService.getExposureCharts(type),
  });
}

export function useOpenWeatherAlerts(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['openweather', 'alerts', lat, lng],
    queryFn: () => openWeatherService.getAlerts(lat!, lng!),
    enabled: !!lat && !!lng,
    refetchInterval: 300000, // Refetch every 5 mins
  });
}
