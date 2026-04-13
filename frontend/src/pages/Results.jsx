import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 180 };

  // JAMB Scaling: (Score / Total) * 400
  const scaledScore = Math.round((score / total) * 400);
  const percentage = Math.round((score / total) * 100);
  const isPass = scaledScore >= 200;

  return (
    <div className="auth-container">
      <div className="glass-panel animate-fade-in" style={{ padding: '50px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        {isPass ? (
          <CheckCircle size={80} color="var(--jamb-green)" style={{ marginBottom: '20px' }} />
        ) : (
          <XCircle size={80} color="var(--error-color)" style={{ marginBottom: '20px' }} />
        )}
        
        <h1 style={{ marginBottom: '5px', fontSize: '2.5rem', color: 'var(--jamb-dark)' }}>
          {isPass ? 'Congratulations!' : 'Keep Practicing!'}
        </h1>
        <div style={{ 
          display: 'inline-block', 
          padding: '5px 20px', 
          borderRadius: '20px', 
          background: isPass ? 'rgba(10, 127, 63, 0.1)' : 'rgba(211, 47, 47, 0.1)', 
          color: isPass ? 'var(--jamb-green)' : 'var(--error-color)',
          fontWeight: 'bold',
          marginBottom: '25px',
          fontSize: '1.1rem'
        }}>
          {isPass ? 'EXAM PASS' : 'EXAM FAIL'}
        </div>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
          Your JAMB-scaled performance is shown below.
        </p>
        
        <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: isPass ? 'var(--jamb-green)' : 'var(--error-color)', lineHeight: '1' }}>
            {scaledScore}
          </div>
          <div style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px', fontWeight: 'bold' }}>
            Out of 400
          </div>
          <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
            Raw Score: {score} / {total} ({percentage}%)
          </div>
        </div>

        <button className="btn" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
          <ArrowLeft style={{ marginRight: '8px' }} size={20} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
