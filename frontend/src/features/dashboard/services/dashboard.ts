import { api } from '@/services/api';
import { DASHBOARD_ENDPOINTS } from './endpoints';
import type {
  DashboardSummaryResponse,
  TrendDataPoint,
  ChartDataResponse,
  Prediction,
  Alert,
  WeatherResponse,
  AQILiveResponse,
  GeocodeResponse,
  AutocompleteResponse,
  ReverseGeocodeResponse,
  DailyForecastResponse,
} from '../types/dashboard';

export const dashboardService = {
  /** GET /dashboard/summary */
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const { data } = await api.get<DashboardSummaryResponse>(DASHBOARD_ENDPOINTS.SUMMARY);
    return data;
  },

  /** GET /dashboard/predictions — returns PredictionAnalytics from backend */
  getRecentPredictions: async (): Promise<Prediction[]> => {
    try {
      // The backend /dashboard/recent-activity returns a list of mixed activities.
      // We'll use the activity endpoint and filter for prediction types.
      const { data } = await api.get<Array<Record<string, unknown>>>(DASHBOARD_ENDPOINTS.RECENT_ACTIVITY);
      if (!Array.isArray(data)) return [];

      return data
        .filter((item) => item.activity_type === 'prediction' || item.type === 'prediction')
        .map((item) => ({
          id: String(item.id ?? item.prediction_id ?? Math.random()),
          city: String(item.city ?? item.location ?? '—'),
          predictedAqi: Number(item.predicted_aqi ?? item.average_predicted_aqi ?? 0),
          predictionTime: String(item.created_at ?? item.prediction_timestamp ?? new Date().toISOString()),
          confidence: Number(item.confidence_score ?? 90),
          healthRisk: String(item.health_risk_level ?? 'Low'),
        }));
    } catch {
      return [];
    }
  },

  /** GET /dashboard/recent-activity — derive alerts from activities */
  getRecentAlerts: async (): Promise<Alert[]> => {
    try {
      const { data } = await api.get<Array<Record<string, unknown>>>(DASHBOARD_ENDPOINTS.RECENT_ACTIVITY);
      if (!Array.isArray(data)) return [];

      // Map high-risk prediction activities or system events into alerts
      return data
        .filter((item) => item.health_risk_level === 'High' || item.health_risk_level === 'Hazardous' || item.activity_type === 'alert')
        .map((item) => ({
          id: String(item.id ?? Math.random()),
          priority: (
            item.health_risk_level === 'Hazardous' ? 'critical' :
            item.health_risk_level === 'High' ? 'high' :
            item.health_risk_level === 'Moderate' ? 'medium' : 'low'
          ) as Alert['priority'],
          time: String(item.created_at ?? new Date().toISOString()),
          message: String(
            item.message ??
            `High AQI detected: ${item.predicted_aqi ?? '—'} in ${item.city ?? 'your area'}`
          ),
          type: (item.activity_type === 'alert' ? 'system' : 'health') as Alert['type'],
        }));
    } catch {
      return [];
    }
  },

  /** GET /dashboard/trends */
  getTrends: async (): Promise<TrendDataPoint[]> => {
    const { data } = await api.get<TrendDataPoint[]>(DASHBOARD_ENDPOINTS.TRENDS);
    return Array.isArray(data) ? data : [];
  },

  /** GET /dashboard/charts?chart_type=area */
  getCharts: async (chartType: 'line' | 'bar' | 'area' | 'pie' = 'area'): Promise<ChartDataResponse> => {
    const { data } = await api.get<ChartDataResponse>(DASHBOARD_ENDPOINTS.CHARTS, {
      params: { chart_type: chartType },
    });
    return data;
  },

  /** GET /weather/current */
  getCurrentWeather: async (lat: number = 37.7749, lon: number = -122.4194): Promise<WeatherResponse> => {
    const { data } = await api.get<WeatherResponse>(DASHBOARD_ENDPOINTS.WEATHER_CURRENT, {
      params: { latitude: lat, longitude: lon },
    });
    return data;
  },

  /** GET /weather/forecast */
  getDailyForecast: async (lat: number = 37.7749, lon: number = -122.4194): Promise<DailyForecastResponse> => {
    const { data } = await api.get<DailyForecastResponse>(DASHBOARD_ENDPOINTS.WEATHER_FORECAST, {
      params: { latitude: lat, longitude: lon },
    });
    return data;
  },

  /** GET /aqi/live */
  getLiveAQI: async (city?: string, lat?: number, lon?: number): Promise<AQILiveResponse> => {
    const params: any = {};
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
    } else if (city) {
      params.city = city;
    }
    const { data } = await api.get<AQILiveResponse>(DASHBOARD_ENDPOINTS.AQI_LIVE, { params });
    return data;
  },

  /** POST /maps/geocode */
  geocode: async (address: string): Promise<GeocodeResponse> => {
    const { data } = await api.post<GeocodeResponse>(DASHBOARD_ENDPOINTS.MAPS_GEOCODE, { address });
    return data;
  },

  /** POST /maps/autocomplete */
  autocomplete: async (text: string): Promise<AutocompleteResponse> => {
    const { data } = await api.post<AutocompleteResponse>(DASHBOARD_ENDPOINTS.MAPS_AUTOCOMPLETE, { text });
    return data;
  },

  /** POST /maps/reverse-geocode */
  reverseGeocode: async (lat: number, lon: number): Promise<ReverseGeocodeResponse> => {
    const { data } = await api.post<ReverseGeocodeResponse>(DASHBOARD_ENDPOINTS.MAPS_REVERSE_GEOCODE, {
      latitude: lat,
      longitude: lon,
    });
    return data;
  },
};
