import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard';

/** Polls every 2 minutes for fresh dashboard summary */
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardService.getSummary,
    refetchInterval: 2 * 60 * 1000, // 2 mins
    staleTime: 60 * 1000,           // consider stale after 1 min
  });
};

export const useRecentPredictions = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-predictions'],
    queryFn: dashboardService.getRecentPredictions,
    staleTime: 60 * 1000,
  });
};

export const useRecentAlerts = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: dashboardService.getRecentAlerts,
    staleTime: 60 * 1000,
  });
};

/** Fetch 30-day AQI trend for the line/area chart */
export const useDashboardTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: dashboardService.getTrends,
    staleTime: 5 * 60 * 1000,
  });
};

/** Fetch pollutant bar chart (area format) */
export const useDashboardCharts = (chartType: 'line' | 'bar' | 'area' | 'pie' = 'bar') => {
  return useQuery({
    queryKey: ['dashboard', 'charts', chartType],
    queryFn: () => dashboardService.getCharts(chartType),
    staleTime: 5 * 60 * 1000,
  });
};

/** Fetch current weather */
export const useCurrentWeather = (lat?: number, lon?: number) => {
  return useQuery({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => dashboardService.getCurrentWeather(lat, lon),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
};

/** Fetch live AQI for a city or coordinates */
export const useLiveAQI = (city?: string, lat?: number, lon?: number) => {
  return useQuery({
    queryKey: ['aqi', 'live', city, lat, lon],
    queryFn: () => dashboardService.getLiveAQI(city, lat, lon),
    staleTime: 2 * 60 * 1000, // 2 mins
    enabled: !!city || (lat !== undefined && lon !== undefined),
  });
};
