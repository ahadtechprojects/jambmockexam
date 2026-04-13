import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut, FileText, CheckCircle, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pastResults, setPastResults] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user results
    fetch('http://localhost:5000/api/exam/results', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPastResults(data);
      })
      .catch(console.error);

  }, [user, navigate, token]);

  if (!user) return null;

  return (
    <div>
      <header className="app-header">
        <h1>
          <GraduationCap size={32} />
          JAMB Portal
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            <User size={20} />
            {user.firstName}
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="main-container animate-fade-in">
        
        {/* Welcome Card */}
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(230,255,230,0.8))' }}>
          <h2 style={{ color: 'var(--jamb-dark)', fontSize: '2rem', marginBottom: '15px' }}>
            Welcome, {user.firstName} {user.lastName}!
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.1rem', color: 'var(--text-main)' }}>
            <div>
              <strong>Reg NO:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', color: 'var(--jamb-green)', background: 'rgba(10, 127, 63, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{user.regNumber || 'Pending'}</span>
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <FileText size={48} color="var(--jamb-green)" style={{ marginBottom: '15px' }} />
            <h2 style={{ marginBottom: '15px' }}>Start Mock Examination</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
              Test your readiness with our simulated CBT exam environment covering 4 subjects.
            </p>
            <button className="btn" onClick={() => navigate('/exam')}>Begin Exam</button>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle color="var(--jamb-green)" />
              Recent Results
            </h3>
            {pastResults.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You have no recorded exams yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {pastResults.slice(0, 5).map(res => (
                  <li key={res.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Score: {res.score} / {res.total}</strong>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {new Date(res.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--jamb-green)', alignSelf: 'center', fontSize: '1.2rem' }}>
                      {Math.round((res.score / res.total) * 100)}%
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
