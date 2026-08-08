import axios from 'axios';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export interface OpenWeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export const openWeatherService = {
  getAlerts: async (lat: number, lon: number): Promise<OpenWeatherAlert[]> => {
    if (!OPENWEATHER_API_KEY) {
      // No API key configured — return empty, components handle the empty state
      return [];
    }

    try {
      // Try One Call API 3.0 first
      const res = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${OPENWEATHER_API_KEY}`
      );
      return res.data.alerts ?? [];
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Fallback to One Call 2.5 if 3.0 subscription not active
        try {
          const res2 = await axios.get(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${OPENWEATHER_API_KEY}`
          );
          return res2.data.alerts ?? [];
        } catch (e) {
          console.error('Failed to fetch OpenWeather 2.5 alerts', e);
        }
      }
      console.error('Failed to fetch OpenWeather alerts', error);
      return [];
    }
  }
};
