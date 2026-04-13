import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 400 };

  const percentage = Math.round((score / total) * 100);

  return (
    <div className="auth-container">
      <div className="glass-panel animate-fade-in" style={{ padding: '50px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <Award size={80} color={percentage > 50 ? 'var(--jamb-green)' : 'var(--error-color)'} style={{ marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '10px', fontSize: '2.5rem', color: 'var(--jamb-dark)' }}>Exam Completed!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px' }}>Your results have been successfully saved.</p>
        
        <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: percentage > 50 ? 'var(--jamb-green)' : 'var(--error-color)', lineHeight: '1' }}>
            {score}
          </div>
          <div style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px', fontWeight: 'bold' }}>
            Out of {total}
          </div>
        </div>

        <button className="btn" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
          <ArrowLeft style={{ marginRight: '8px' }} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
