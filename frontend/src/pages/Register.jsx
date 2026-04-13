import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError("PINs do not match");
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }) 
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Registration successful! Your Reg No is ${data.regNumber}. Redirecting to login...`);
        setTimeout(() => navigate('/login'), 3500);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in" style={{ maxWidth: '550px' }}>
        <h2>
          <BookOpen style={{ marginRight: '8px', color: 'var(--jamb-green)' }} />
          Candidate Registration
        </h2>
        {error && <p style={{ color: 'var(--error-color)', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'var(--jamb-green)', marginBottom: '15px', textAlign: 'center', background: 'var(--jamb-light)', padding: '10px', borderRadius: '8px' }}>{success}</p>}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="input-group">
              <label>First Name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
                placeholder="First Name"
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
                placeholder="Last Name"
              />
            </div>
          </div>

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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="input-group">
              <label>Create PIN</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter PIN"
              />
            </div>
            <div className="input-group">
              <label>Confirm PIN</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Re-enter PIN"
              />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            <UserPlus size={18} /> Register Account
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--jamb-green)', fontWeight: 'bold' }}>Log in Here</Link>
        </p>
      </div>
    </div>
  );
}
