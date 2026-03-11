import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [creds, setCreds] = useState({ username: '', code: '' });
  const navigate = useNavigate();


  //STS-SIG-09
  //STS-2026
  const handleLogin = (e) => {
    e.preventDefault();
    if (creds.code === 'STS-2026') {
      onLogin();
      navigate('/');
    } else {
      alert("INVALID AUTHENTICATION CODE");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="shield-icon">🛡️</div>
        <h2>SIGTRACK AUTHENTICATION</h2>
        <p>RESTRICTED ACCESS: BURMA CAMP PERSONNEL ONLY</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="OPERATOR ID" 
            required 
            onChange={e => setCreds({...creds, username: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="ACCESS CODE" 
            required 
            onChange={e => setCreds({...creds, code: e.target.value})}
          />
          <button type="submit">AUTHORIZE ACCESS</button>
        </form>
      </div>
    </div>
  );
}