import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';
import HourlyForecast from './components/HourlyForecast';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorCard from './components/ErrorCard';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchWeatherByCoords,
  fetchForecastByCoords,
} from './services/api';
import './styles.css';

const MAX_HISTORY = 6;

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('wt-theme') || 'dark');
  const [unit, setUnit] = useState(() => localStorage.getItem('wt-unit') || 'C');
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wt-history') || '[]'); } catch { return []; }
  });
  const [locating, setLocating] = useState(false);
  const [lastCity, setLastCity] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wt-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wt-unit', unit);
  }, [unit]);

  const saveHistory = (city) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== city.toLowerCase());
      const updated = [city, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem('wt-history', JSON.stringify(updated));
      return updated;
    });
  };

  const doSearch = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    setLastCity(city);
    try {
      const [w, f] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city),
      ]);
      setWeather(w);
      setForecast(f);
      saveHistory(city);
    } catch (err) {
      const msg = err.response?.status === 404
        ? `City "${city}" not found. Please check the spelling and try again.`
        : err.response?.status === 401
          ? 'Invalid API key. Please check your VITE_WEATHER_API_KEY.'
          : 'Failed to fetch weather data. Please check your internet connection.';
      setError(msg);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLoading(true);
        try {
          const [w, f] = await Promise.all([
            fetchWeatherByCoords(lat, lon),
            fetchForecastByCoords(lat, lon),
          ]);
          setWeather(w);
          setForecast(f);
          setLastCity(w.name);
          saveHistory(w.name);
        } catch {
          setError('Failed to fetch weather for your location.');
        } finally {
          setLoading(false);
          setLocating(false);
        }
      },
      () => {
        setError('Location access denied. Please search manually.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleUnitToggle = () => setUnit(u => u === 'C' ? 'F' : 'C');

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('wt-history');
  };

  return (
    <div className="app" data-theme={theme}>
      <div className="app-bg">
        <div className="bg-orb orb1"></div>
        <div className="bg-orb orb2"></div>
        <div className="bg-orb orb3"></div>
      </div>

      <header className="app-header">
        <div className="header-brand">
          <span className="brand-logo">🌦️</span>
          <div>
            <h1 className="brand-title">WeatherPulse</h1>
            <p className="brand-subtitle">Real-time global weather insights</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`location-btn ${locating ? 'locating' : ''}`}
            onClick={detectLocation}
            title="Auto-detect my location"
            id="detect-location-btn"
            disabled={locating}
          >
            {locating ? '⏳' : '📍'}
            <span>{locating ? 'Locating...' : 'My Location'}</span>
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle dark/light mode"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchBar
            onSearch={doSearch}
            searchHistory={searchHistory}
            onHistorySelect={doSearch}
          />
          {searchHistory.length > 0 && (
            <button className="clear-history-btn" onClick={clearHistory} id="clear-history-btn">
              Clear History
            </button>
          )}
        </div>

        {loading && <LoadingSpinner />}

        {error && !loading && (
          <ErrorCard message={error} onRetry={lastCity ? () => doSearch(lastCity) : null} />
        )}

        {!loading && !error && !weather && (
          <div className="welcome-state">
            <div className="welcome-emoji">🌍</div>
            <h2 className="welcome-title">Discover the Weather Anywhere</h2>
            <p className="welcome-sub">Search for any city or use your current location to get live weather data and 5-day forecasts.</p>
            <div className="welcome-features">
              {['🌡️ Real-time Temperature', '💧 Humidity & Pressure', '🌬️ Wind Speed & Direction', '📅 5-Day Forecast', '🕐 Hourly Breakdown', '🌍 Global Coverage'].map(f => (
                <div key={f} className="feature-chip">{f}</div>
              ))}
            </div>
          </div>
        )}

        {!loading && weather && (
          <div className="results-container">
            <WeatherCard data={weather} unit={unit} onUnitToggle={handleUnitToggle} />
            {forecast && <HourlyForecast data={forecast} unit={unit} />}
            {forecast && <Forecast data={forecast} unit={unit} />}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap API</a> · Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
