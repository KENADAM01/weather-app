import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

const api = axios.create({ baseURL: BASE_URL });

export const fetchCurrentWeather = async (city) => {
  const response = await api.get('/weather', {
    params: { q: city, appid: API_KEY, units: 'metric' },
  });
  return response.data;
};

export const fetchWeatherByCoords = async (lat, lon) => {
  const response = await api.get('/weather', {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });
  return response.data;
};

export const fetchForecast = async (city) => {
  const response = await api.get('/forecast', {
    params: { q: city, appid: API_KEY, units: 'metric', cnt: 40 },
  });
  return response.data;
};

export const fetchForecastByCoords = async (lat, lon) => {
  const response = await api.get('/forecast', {
    params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
  });
  return response.data;
};

export const fetchCitySuggestions = async (query) => {
  const response = await axios.get(`${GEO_URL}/direct`, {
    params: { q: query, limit: 5, appid: API_KEY },
  });
  return response.data;
};

export const getWeatherIconUrl = (icon, size = '2x') =>
  `https://openweathermap.org/img/wn/${icon}@${size}.png`;

export const groupForecastByDay = (list) => {
  const days = {};
  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  return Object.entries(days).slice(0, 5);
};

export const getHourlyForecast = (list) => list.slice(0, 8);
