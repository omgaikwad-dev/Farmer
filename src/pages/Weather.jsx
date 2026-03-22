import { motion } from 'framer-motion';
import { weatherData } from '../data/mockData';
import { FiDroplet, FiWind, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import './Weather.css';

export default function Weather() {
  return (
    <div className="weather-page">
      <motion.div
        className="wp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🌦️ Weather & Crop Advisory</h1>
        <p>Real-time weather updates to help you plan your farming activities</p>
      </motion.div>

      {/* Current Weather */}
      <motion.div
        className="weather-current"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="wc-main">
          <div className="wc-icon">{weatherData.current.icon}</div>
          <div className="wc-temp">{weatherData.current.temp}°C</div>
          <div className="wc-condition">{weatherData.current.condition}</div>
          <div className="wc-location">📍 {weatherData.current.location}</div>
        </div>
        <div className="wc-details">
          <div className="wc-detail">
            <FiDroplet />
            <div>
              <span className="wcd-label">Humidity</span>
              <span className="wcd-value">{weatherData.current.humidity}%</span>
            </div>
          </div>
          <div className="wc-detail">
            <FiWind />
            <div>
              <span className="wcd-label">Wind Speed</span>
              <span className="wcd-value">{weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <div className="weather-alerts">
        {weatherData.alerts.map((alert, i) => (
          <motion.div
            key={i}
            className={`weather-alert ${alert.type}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            {alert.type === 'warning' ? <FiAlertTriangle /> : <FiInfo />}
            <span>{alert.message}</span>
          </motion.div>
        ))}
      </div>

      {/* Forecast */}
      <motion.div
        className="weather-forecast"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>7-Day Forecast</h3>
        <div className="forecast-grid">
          {weatherData.forecast.map((day, i) => (
            <motion.div
              key={i}
              className="forecast-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="fc-day">{day.day}</div>
              <div className="fc-icon">{day.icon}</div>
              <div className="fc-temp">{day.temp}°C</div>
              <div className="fc-condition">{day.condition}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Crop Advisory */}
      <motion.div
        className="crop-advisory"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>🌾 Crop Advisory</h3>
        <div className="advisory-grid">
          <div className="advisory-card">
            <span className="advisory-icon">🍅</span>
            <h4>Tomato</h4>
            <p>Water regularly. Avoid spraying during afternoon heat. Harvest early morning.</p>
            <span className="badge badge-success">Good Season</span>
          </div>
          <div className="advisory-card">
            <span className="advisory-icon">🌾</span>
            <h4>Wheat</h4>
            <p>Ideal sowing conditions next week. Prepare soil and ensure proper drainage.</p>
            <span className="badge badge-info">Sowing Time</span>
          </div>
          <div className="advisory-card">
            <span className="advisory-icon">🥔</span>
            <h4>Potato</h4>
            <p>Watch for late blight due to expected rain. Apply fungicide preventively.</p>
            <span className="badge badge-warning">Alert</span>
          </div>
          <div className="advisory-card">
            <span className="advisory-icon">🌻</span>
            <h4>Sunflower</h4>
            <p>Good growth period. Ensure adequate sunlight exposure and minimal shade.</p>
            <span className="badge badge-success">Growing Well</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
