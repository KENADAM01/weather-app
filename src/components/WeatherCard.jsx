import { getWeatherIconUrl } from '../services/api';

const getWindDirection = (deg) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const getUVLevel = (uv) => {
  if (uv <= 2) return { label: 'Low', color: '#4ade80' };
  if (uv <= 5) return { label: 'Moderate', color: '#facc15' };
  if (uv <= 7) return { label: 'High', color: '#fb923c' };
  if (uv <= 10) return { label: 'Very High', color: '#f87171' };
  return { label: 'Extreme', color: '#c084fc' };
};

const WeatherCard = ({ data, unit, onUnitToggle }) => {
  if (!data) return null;

  const tempC = data.main.temp;
  const feelsC = data.main.feels_like;
  const tempMin = data.main.temp_min;
  const tempMax = data.main.temp_max;

  const displayTemp = unit === 'C' ? tempC : (tempC * 9 / 5 + 32);
  const displayFeels = unit === 'C' ? feelsC : (feelsC * 9 / 5 + 32);
  const displayMin = unit === 'C' ? tempMin : (tempMin * 9 / 5 + 32);
  const displayMax = unit === 'C' ? tempMax : (tempMax * 9 / 5 + 32);

  const windDir = getWindDirection(data.wind.deg || 0);
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const localTime = new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const weatherMain = data.weather[0].main.toLowerCase();
  let bgClass = 'card-clear';
  if (weatherMain.includes('cloud')) bgClass = 'card-cloudy';
  else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) bgClass = 'card-rainy';
  else if (weatherMain.includes('snow')) bgClass = 'card-snow';
  else if (weatherMain.includes('thunder')) bgClass = 'card-thunder';
  else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze')) bgClass = 'card-mist';

  return (
    <div className={`weather-card ${bgClass}`}>
      <div className="card-glow"></div>

      <div className="card-header">
        <div className="location-info">
          <div className="city-name">
            <span className="pin-icon">📍</span>
            {data.name}, {data.sys.country}
          </div>
          <div className="local-time">{localTime}</div>
        </div>
        <button className="unit-toggle" onClick={onUnitToggle} title="Toggle temperature unit" id="unit-toggle-btn">
          <span className={unit === 'C' ? 'active-unit' : ''}>°C</span>
          <span className="unit-divider">|</span>
          <span className={unit === 'F' ? 'active-unit' : ''}>°F</span>
        </button>
      </div>

      <div className="temp-section">
        <div className="temp-icon-group">
          <img
            src={getWeatherIconUrl(data.weather[0].icon, '4x')}
            alt={data.weather[0].description}
            className="weather-icon-main"
          />
          <div className="temp-display">
            <span className="temp-value">{Math.round(displayTemp)}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
        </div>
        <div className="weather-desc">{data.weather[0].description}</div>
        <div className="temp-range">
          <span className="temp-min">↓ {Math.round(displayMin)}°</span>
          <span className="temp-max">↑ {Math.round(displayMax)}°</span>
          <span className="feels-like">Feels like {Math.round(displayFeels)}°</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-value">{data.main.humidity}%</div>
          <div className="stat-label">Humidity</div>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${data.main.humidity}%`, background: 'var(--accent-blue)' }}></div></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌬️</div>
          <div className="stat-value">{(data.wind.speed * 3.6).toFixed(1)} <span className="stat-unit">km/h</span></div>
          <div className="stat-label">Wind {windDir}</div>
          <div className="wind-compass">
            <div className="compass-needle" style={{ transform: `rotate(${data.wind.deg || 0}deg)` }}>↑</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{(data.visibility / 1000).toFixed(1)} <span className="stat-unit">km</span></div>
          <div className="stat-label">Visibility</div>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${Math.min(100, (data.visibility / 10000) * 100)}%`, background: 'var(--accent-purple)' }}></div></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌡️</div>
          <div className="stat-value">{data.main.pressure} <span className="stat-unit">hPa</span></div>
          <div className="stat-label">Pressure</div>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${Math.min(100, ((data.main.pressure - 950) / 100) * 100)}%`, background: 'var(--accent-orange)' }}></div></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌅</div>
          <div className="stat-value">{sunrise}</div>
          <div className="stat-label">Sunrise</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌇</div>
          <div className="stat-value">{sunset}</div>
          <div className="stat-label">Sunset</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">☁️</div>
          <div className="stat-value">{data.clouds.all}%</div>
          <div className="stat-label">Cloud Cover</div>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${data.clouds.all}%`, background: 'var(--accent-teal)' }}></div></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌊</div>
          <div className="stat-value">{data.main.sea_level ?? data.main.grnd_level ?? '—'} <span className="stat-unit">hPa</span></div>
          <div className="stat-label">Sea Level</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
