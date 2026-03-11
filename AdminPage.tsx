import React, { useState, useEffect } from 'react';

export default function AdminPage({ alerts, dispatch, calculateScore }) {
  const [viewMode, setViewMode] = useState('priority');
  const [zuluTime, setZuluTime] = useState(new Date().toUTCString().split(' ')[4]);
  const [classifyingId, setClassifyingId] = useState(null);
  const [newAlertBanner, setNewAlertBanner] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setZuluTime(new Date().toUTCString().split(' ')[4]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const latest = alerts[0];
    if (latest && (Date.now() - new Date(latest.timestamp).getTime()) < 3000) {
      setNewAlertBanner(latest);
      setTimeout(() => setNewAlertBanner(null), 8000);

      if (Notification.permission === 'granted') {
        new Notification("🚨 NEW SIGNAL", { body: `${latest.category}: ${latest.type}` });
        const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        beep.play().catch(() => {});
      }
    }
  }, [alerts]);

  const downloadLogs = () => {
    const header = `STS SIGTRACK MISSION LOG | DATE: ${new Date().toLocaleDateString()} | ZULU: ${zuluTime}\n`;
    const separator = "----------------------------------------------------------------------\n";
    const body = alerts.map(a => 
      `[${new Date(a.timestamp).toUTCString()}] ID: ${a.id} | CAT: ${a.category} | SEV: ${a.severity.toUpperCase()} | MSG: ${a.type}`
    ).join('\n');
    
    const blob = new Blob([header + separator + body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MISSION_LOG_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const getSortedAlerts = () => {
    const currentAlerts = [...alerts];
    if (viewMode === 'timeline') return currentAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return currentAlerts.sort((a, b) => {
      if (a.status === 'acknowledged' && b.status !== 'acknowledged') return 1;
      if (b.status === 'acknowledged' && a.status !== 'acknowledged') return -1;
      return calculateScore(b) - calculateScore(a);
    });
  };

  return (
    <div className="toc-container">
      {newAlertBanner && (
        <div className="alert-popup-banner">
            <strong>🚨 NEW SIGNAL DETECTED</strong>
            <p>{newAlertBanner.id} | {newAlertBanner.category}: {newAlertBanner.type}</p>
        </div>
      )}

      <header className="toc-header">
        <div className="title-block">
          <h1>Soko Ops Center <span className="mission-clock">[{zuluTime} ZULU]</span></h1>
          <p>STS Burma Camp | Synchronized Tactical Feed</p>
        </div>
        <div className="toc-controls">
          <button className={viewMode === 'priority' ? 'active' : ''} onClick={() => setViewMode('priority')}>PRIORITY</button>
          <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>ZULU LOG</button>
          <button className="mission-btn download" onClick={downloadLogs}>📥 DOWNLOAD LOGS</button>
          <button className="mission-btn clear" onClick={() => { if(window.confirm("PURGE ALL MISSION DATA?")) dispatch({type: 'CLEAR_LOGS'}) }}>🧹 CLEAR MISSION</button>
        </div>
      </header>

      <div className="table-wrapper">
        <table className="incident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ZULU TIME</th>
              <th>CATEGORY</th>
              <th>INCIDENT DETAILS</th>
              <th>SEVERITY</th>
              <th>SCORE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {getSortedAlerts().map(alert => (
              <tr key={alert.id} className={`${alert.severity} ${alert.status}`}>
                <td>{alert.id}</td>
                <td className="time-col">{new Date(alert.timestamp).toUTCString().split(' ')[4]} Z</td>
                <td>{alert.category}</td>
                <td className="details-col">{alert.type}</td>
                <td><span className={`badge ${alert.severity}`}>{alert.severity.toUpperCase()}</span></td>
                <td>{Math.floor(calculateScore(alert))}</td>
                <td>
                   {alert.status === 'pending_review' ? (
                     classifyingId === alert.id ? (
                       <div className="severity-chooser">
                         <button onClick={() => {dispatch({type: 'SET_SEVERITY', id: alert.id, severity: 'critical'}); setClassifyingId(null)}}>CRI</button>
                         <button onClick={() => {dispatch({type: 'SET_SEVERITY', id: alert.id, severity: 'high'}); setClassifyingId(null)}}>HI</button>
                         <button onClick={() => {dispatch({type: 'SET_SEVERITY', id: alert.id, severity: 'medium'}); setClassifyingId(null)}}>MED</button>
                         <button onClick={() => {dispatch({type: 'SET_SEVERITY', id: alert.id, severity: 'low'}); setClassifyingId(null)}}>LOW</button>
                       </div>
                     ) : (
                       <button className="action-btn" onClick={() => setClassifyingId(alert.id)}>CLASSIFY</button>
                     )
                  ) : (
                    <button 
                      className="action-btn ack" 
                      disabled={alert.status === 'acknowledged'}
                      onClick={() => dispatch({ type: 'ACKNOWLEDGE', id: alert.id })}
                    >
                      {alert.status === 'acknowledged' ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}