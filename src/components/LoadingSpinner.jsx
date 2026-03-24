const LoadingSpinner = ({ message = 'Fetching weather data...' }) => (
  <div className="loading-overlay">
    <div className="spinner-container">
      <div className="orbit-spinner">
        <div className="orbit o1"></div>
        <div className="orbit o2"></div>
        <div className="orbit o3"></div>
        <div className="orbit-core">🌤️</div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
