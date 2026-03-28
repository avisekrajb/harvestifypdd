import React from 'react'
import { FaFlask, FaLeaf, FaTint, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import './FertilizerResult.css'

const FertilizerResult = ({ prediction }) => {
  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#4ade80'
    if (conf >= 60) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div className="fertilizer-result">
      <div className="result-header">
        <div className="result-icon">
          <FaFlask />
        </div>
        <div>
          <h2>Fertilizer Recommendation</h2>
          <p>Based on your soil analysis and crop requirements</p>
        </div>
      </div>

      <div className="result-card">
        <div className="fertilizer-name">
          <FaLeaf className="fertilizer-icon" />
          <h3>{prediction.fertilizer}</h3>
          <div className="confidence-badge" style={{ background: getConfidenceColor(prediction.confidence) }}>
            {prediction.confidence}% Match
          </div>
        </div>

        <div className="nutrient-grid">
          <div className="nutrient-item">
            <span className="nutrient-label">Nitrogen (N)</span>
            <span className="nutrient-value">{prediction.n_amount} kg/ha</span>
          </div>
          <div className="nutrient-item">
            <span className="nutrient-label">Phosphorus (P)</span>
            <span className="nutrient-value">{prediction.p_amount} kg/ha</span>
          </div>
          <div className="nutrient-item">
            <span className="nutrient-label">Potassium (K)</span>
            <span className="nutrient-value">{prediction.k_amount} kg/ha</span>
          </div>
        </div>

        <div className="tips-section">
          <div className="tips-header">
            <FaInfoCircle />
            <span>Application Tips</span>
          </div>
          <p>{prediction.tips}</p>
        </div>

        <div className="recommendation-note">
          <FaCheckCircle />
          <span>This recommendation is optimized for maximum yield and soil health</span>
        </div>
      </div>
    </div>
  )
}

export default FertilizerResult