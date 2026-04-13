import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const BASE_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
        if (data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <h2>
          <BookOpen style={{ marginRight: '8px', color: 'var(--jamb-green)' }} />
          JAMB Portal Login
        </h2>
        {error && <p style={{ color: 'var(--error-color)', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
            />
          </div>
          <div className="input-group">
            <label>PIN (Password)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your PIN"
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            <LogIn size={18} /> Secure Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--jamb-green)', fontWeight: 'bold' }}>Register Here</Link>
        </p>
      </div>
    </div>
  );
}
