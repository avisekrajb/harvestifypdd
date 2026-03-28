import React from 'react'
import { FaSeedling, FaPercent } from 'react-icons/fa'
import './CropCard.css'

const CropCard = ({ crop, confidence, index }) => {
  const getCropEmoji = (cropName) => {
    const emojiMap = {
      'rice': '🌾',
      'wheat': '🌾',
      'maize': '🌽',
      'cotton': '🌿',
      'groundnut': '🥜',
      'soybean': '🫘',
      'sugarcane': '🎋',
      'potato': '🥔',
      'tomato': '🍅',
      'onion': '🧅'
    }
    return emojiMap[cropName?.toLowerCase()] || '🌱'
  }

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#4ade80'
    if (conf >= 60) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div className="crop-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="crop-rank">#{index + 1}</div>
      <div className="crop-emoji">{getCropEmoji(crop)}</div>
      <div className="crop-info">
        <h3 className="crop-name">{crop}</h3>
        <div className="confidence-bar">
          <div 
            className="confidence-fill" 
            style={{ width: `${confidence}%`, background: getConfidenceColor(confidence) }}
          />
        </div>
        <div className="confidence-text">
          <FaPercent className="confidence-icon" />
          <span>{confidence}% Match</span>
        </div>
      </div>
    </div>
  )
}

export default CropCard