export interface GeocodeResult {
  name: string;
  admin1?: string;
  country?: string;
  lat: number;
  lng: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  precipitationProbability: number | null;
}
