import React from 'react'
import { format } from 'date-fns'
import { FaCalendar, FaLeaf, FaFlask } from 'react-icons/fa'
import './FertilizerHistoryTable.css'

const FertilizerHistoryTable = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="empty-history">
        <div className="empty-icon">🧪</div>
        <h3>No Fertilizer History Yet</h3>
        <p>Start by getting fertilizer recommendations to see your history here</p>
      </div>
    )
  }

  return (
    <div className="history-table-container">
      <table className="history-table">
        <thead>
          <tr>
            <th><FaCalendar /> Date</th>
            <th><FaLeaf /> Crop & Soil</th>
            <th><FaFlask /> Recommended Fertilizer</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, idx) => (
            <tr key={idx}>
              <td className="history-date">
                {format(new Date(item.created_at), 'dd MMM yyyy')}
                <span className="history-time">
                  {format(new Date(item.created_at), 'hh:mm a')}
                </span>
              </td>
              <td className="history-crop">
                <div className="crop-badge">{item.input_data.crop}</div>
                <div className="soil-badge">{item.input_data.soilType}</div>
                <div className="nutrient-badges">
                  <span>N: {item.input_data.nLevel}</span>
                  <span>P: {item.input_data.pLevel}</span>
                  <span>K: {item.input_data.kLevel}</span>
                  <span>pH: {item.input_data.ph}</span>
                </div>
              </td>
              <td className="history-fertilizer">
                <div className="fertilizer-badge">
                  {item.recommendations?.[0]?.fertilizer}
                </div>
                <div className="fertilizer-details">
                  N: {item.recommendations?.[0]?.n_amount} kg/ha |
                  P: {item.recommendations?.[0]?.p_amount} kg/ha |
                  K: {item.recommendations?.[0]?.k_amount} kg/ha
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FertilizerHistoryTable