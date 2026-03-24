const ErrorCard = ({ message, onRetry }) => (
  <div className="error-card">
    <div className="error-icon">⚠️</div>
    <h3 className="error-title">Oops! Something went wrong</h3>
    <p className="error-message">{message}</p>
    {onRetry && (
      <button className="retry-btn" onClick={onRetry} id="retry-button">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorCard;
