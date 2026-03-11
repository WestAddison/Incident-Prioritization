import React, { useState } from 'react';
import './report.css';

const CATEGORIES = [
  { id: 'UAV Comms', icon: '📡' },
  { id: 'Electronic War', icon: '⚡' },
  { id: 'Payload/Optics', icon: '📷' },
  { id: 'C2 Link', icon: '💻' },
  { id: 'Power/Prop', icon: '🔋' },
  { id: 'Nav/Position', icon: '🛰️' }
];

export default function ReportPage({ onSend }) {
  const [report, setReport] = useState({ category: 'UAV Comms', type: '' });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsTransmitting(true);

    setTimeout(() => {
      const finalData = {
        ...report,
        id: `OP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        // TIMESTAMP IN UTC (ZULU)
        timestamp: new Date().toISOString(), 
        status: 'pending_review',
        severity: 'pending'
      };
      
      onSend(finalData);
      setIsTransmitting(false);
      setIsSuccess(true);
      setReport({ ...report, type: '' });
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="report-container">
      <div className="status-bar">
        <span>📶 SIGNAL: STABLE</span>
        <span>🔐 ENCRYPTION: AES-256</span>
      </div>
      <form onSubmit={handleFormSubmit} className="tactical-form">
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className={`category-card ${report.category === cat.id ? 'active' : ''}`}
              onClick={() => setReport({...report, category: cat.id})}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.id}</span>
            </div>
          ))}
        </div>
        <textarea required placeholder="Entry mission details..." value={report.type} onChange={e => setReport({...report, type: e.target.value})} />
        <button type="submit" className="submit-signal" disabled={isTransmitting}>
          {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT TO BASE'}
        </button>
      </form>
    </div>
  );
}