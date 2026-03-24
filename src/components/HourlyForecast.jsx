import { getWeatherIconUrl, getHourlyForecast } from '../services/api';

const HourlyForecast = ({ data, unit }) => {
  if (!data) return null;
  const hours = getHourlyForecast(data.list);
  const toDisplay = (tempC) => unit === 'C' ? tempC : (tempC * 9 / 5 + 32);

  return (
    <div className="hourly-section">
      <h2 className="section-title">
        <span className="section-icon">🕐</span> Hourly Forecast
      </h2>
      <div className="hourly-scroll">
        {hours.map((item, idx) => {
          const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const pop = Math.round((item.pop || 0) * 100);
          return (
            <div className="hourly-card" key={item.dt} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="hourly-time">{idx === 0 ? 'Now' : time}</div>
              <img
                src={getWeatherIconUrl(item.weather[0].icon, '2x')}
                alt={item.weather[0].description}
                className="hourly-icon"
              />
              <div className="hourly-temp">{Math.round(toDisplay(item.main.temp))}°</div>
              {pop > 0 && (
                <div className="hourly-pop">
                  <span className="pop-drop">💧</span> {pop}%
                </div>
              )}
              <div className="hourly-wind">{(item.wind.speed * 3.6).toFixed(0)} km/h</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;
