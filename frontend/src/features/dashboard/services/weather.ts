import { api } from '@/services/api';
import type { WeatherResponse } from '../types/weather';

export const weatherService = {
  getCurrentWeather: async (latitude: number, longitude: number): Promise<WeatherResponse> => {
    const { data } = await api.get<WeatherResponse>('/weather/current', {
      params: { latitude, longitude }
    });
    return data;
  }
};
