export interface WeatherResponse {
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  visibility?: number;
  cloud_coverage: number;
  rainfall?: number;
  description: string;
}
