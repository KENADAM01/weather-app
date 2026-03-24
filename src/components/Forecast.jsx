import { getWeatherIconUrl, groupForecastByDay } from '../services/api';

const Forecast = ({ data, unit }) => {
  if (!data) return null;
  const days = groupForecastByDay(data.list);

  const toDisplay = (tempC) => unit === 'C' ? tempC : (tempC * 9 / 5 + 32);

  return (
    <div className="forecast-section">
      <h2 className="section-title">
        <span className="section-icon">📅</span> 5-Day Forecast
      </h2>
      <div className="forecast-grid">
        {days.map(([date, items], idx) => {
          const temps = items.map(i => i.main.temp);
          const minTemp = Math.min(...temps);
          const maxTemp = Math.max(...temps);
          const noon = items[Math.floor(items.length / 2)];
          const avgHumidity = Math.round(items.reduce((a, b) => a + b.main.humidity, 0) / items.length);
          const avgWind = (items.reduce((a, b) => a + b.wind.speed, 0) / items.length * 3.6).toFixed(1);
          const weatherDesc = noon.weather[0].description;
          const icon = noon.weather[0].icon;

          return (
            <div className="forecast-card" key={date} style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="forecast-date">{idx === 0 ? 'Today' : date.split(',')[0]}</div>
              <div className="forecast-date-sub">{date.split(',').slice(1).join(',').trim()}</div>
              <img
                src={getWeatherIconUrl(icon, '2x')}
                alt={weatherDesc}
                className="forecast-icon"
              />
              <div className="forecast-desc">{weatherDesc}</div>
              <div className="forecast-temps">
                <span className="f-max">↑{Math.round(toDisplay(maxTemp))}°</span>
                <span className="f-min">↓{Math.round(toDisplay(minTemp))}°</span>
              </div>
              <div className="forecast-extras">
                <span>💧 {avgHumidity}%</span>
                <span>🌬️ {avgWind} km/h</span>
              </div>
              <div className="forecast-range-bar">
                <div
                  className="forecast-range-fill"
                  style={{
                    left: `${((minTemp + 20) / 60) * 100}%`,
                    width: `${((maxTemp - minTemp) / 60) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;
