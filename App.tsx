import React, { useState, useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReportPage from './ReportPage';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';
import './App.css';

const SEVERITY_WEIGHTS = { critical: 100, high: 75, medium: 50, low: 25, pending: 0 };

const initialState = {
  alerts: JSON.parse(localStorage.getItem('sigtrack_alerts') || '[]')
};

const calculateScore = (alert) => {
  const baseScore = SEVERITY_WEIGHTS[alert.severity] || 0;
  const ageInSeconds = (Date.now() - new Date(alert.timestamp).getTime()) / 1000;
  return baseScore + Math.floor(ageInSeconds / 30);
};

const alertReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'NEW_FIELD_REPORT':
      newState = { ...state, alerts: [action.payload, ...state.alerts] };
      break;
    case 'SET_SEVERITY':
      newState = {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.id ? { ...a, severity: action.severity, status: 'open' } : a
        )
      };
      break;
    case 'ACKNOWLEDGE':
      newState = { 
        ...state, 
        alerts: state.alerts.map(a => 
          a.id === action.id ? { ...a, status: 'acknowledged' } : a
        ) 
      };
      break;
    case 'CLEAR_LOGS':
      newState = { ...state, alerts: [] };
      break;
    case 'SYNC_EXTERNAL':
      return { ...state, alerts: action.payload };
    case 'UPDATE_TICK':
      return { ...state };
    default:
      return state;
  }
  localStorage.setItem('sigtrack_alerts', JSON.stringify(newState.alerts));
  return newState;
};

export default function App() {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sigtrack_alerts' && e.newValue) {
        dispatch({ type: 'SYNC_EXTERNAL', payload: JSON.parse(e.newValue) });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'UPDATE_TICK' }), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className={`sigtrack-app ${theme}`}>
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️ DAY MODE' : '🌙 NIGHT OPS'}
        </button>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
          <Route 
            path="/" 
            element={isAuthenticated ? <ReportPage onSend={(d) => dispatch({ type: 'NEW_FIELD_REPORT', payload: d })} /> : <Navigate to="/login" />} 
          />
          <Route path="/admin" element={<AdminPage alerts={state.alerts} dispatch={dispatch} calculateScore={calculateScore} />} />
        </Routes>
      </div>
    </Router>
  );
}