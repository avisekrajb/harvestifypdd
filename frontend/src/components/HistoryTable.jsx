import React from 'react'
import { format } from 'date-fns'
import { FaCalendar, FaLeaf, FaChartLine } from 'react-icons/fa'
import './HistoryTable.css'

const HistoryTable = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="empty-history">
        <div className="empty-icon">📊</div>
        <h3>No History Yet</h3>
        <p>Start by getting crop recommendations to see your history here</p>
      </div>
    )
  }

  return (
    <div className="history-table-container">
      <table className="history-table">
        <thead>
          <tr>
            <th><FaCalendar /> Date</th>
            <th><FaLeaf /> Soil Parameters</th>
            <th><FaChartLine /> Top Recommendations</th>
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
              <td className="history-params">
                <div className="param-badge">N: {item.input_data.N}</div>
                <div className="param-badge">P: {item.input_data.P}</div>
                <div className="param-badge">K: {item.input_data.K}</div>
                <div className="param-badge">pH: {item.input_data.ph}</div>
                <div className="param-badge">Rain: {item.input_data.rainfall}mm</div>
              </td>
              <td className="history-recommendations">
                {item.recommendations?.slice(0, 3).map((rec, i) => (
                  <span key={i} className="rec-badge">
                    {rec.crop} ({rec.confidence}%)
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HistoryTable