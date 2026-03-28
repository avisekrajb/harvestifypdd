import React from 'react'
import { FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa'
import './WeatherWidget.css'

const WeatherWidget = ({ weather, loading, city, state }) => {
  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-skeleton"></div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <span className="weather-location">
          📍 {city}, {state}
        </span>
        <span className="weather-updated">
          Updated: {weather.last_updated || 'Just now'}
        </span>
      </div>
      <div className="weather-content">
        <div className="weather-main">
          <div className="weather-temp">
            <FaThermometerHalf />
            <span>{weather.temperature?.toFixed(1)}°C</span>
          </div>
          <div className="weather-condition">
            {weather.condition || 'Clear'}
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <FaTint />
            <span>{weather.humidity?.toFixed(1)}% Humidity</span>
          </div>
          <div className="weather-detail">
            <FaWind />
            <span>{weather.wind_speed?.toFixed(1)} km/h Wind</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget