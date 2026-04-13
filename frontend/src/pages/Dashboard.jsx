import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut, FileText, CheckCircle, XCircle, GraduationCap, Book } from 'lucide-react';

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
    const BASE_URL = import.meta.env.VITE_API_URL;
    fetch(`${BASE_URL}/api/exam/results`, {
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <strong style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Registration Number</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--jamb-green)', background: 'rgba(10, 127, 63, 0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginTop: '5px' }}>
                {user.regNumber || 'Pending'}
              </div>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Chosen Course</strong>
              <div style={{ fontSize: '1.1rem', color: 'var(--jamb-dark)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                <Book size={18} color="var(--jamb-green)" /> {user.course || 'Not Specified'}
              </div>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</strong>
              <div style={{ fontSize: '1rem', color: '#444', marginTop: '5px' }}>{user.email}</div>
            </div>
          </div>
          
          {!user.course && (
            <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(211, 47, 47, 0.1)', borderLeft: '4px solid var(--error-color)', borderRadius: '4px', fontSize: '0.9rem', color: '#666' }}>
              <strong>Profile Incomplete:</strong> Your chosen course is missing. Please <Link to="/register" style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>re-register</Link> or contact support to have your mock battery assigned.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <FileText size={48} color="var(--jamb-green)" style={{ marginBottom: '15px' }} />
            <h2 style={{ marginBottom: '15px' }}>Start Mock Examination</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
              Take a full simulation of your {user.course || 'JAMB'} exam combinations.
            </p>
            <button className="btn" onClick={() => navigate('/exam')}>Begin Exam</button>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle color="var(--jamb-green)" />
              Recent Results (Scaled / 400)
            </h3>
            {pastResults.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You have no recorded exams yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {pastResults.slice(0, 5).map(res => {
                  const scaledScore = Math.round((res.score / res.total) * 400);
                  const isPass = scaledScore >= 200;
                  return (
                    <li key={res.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isPass ? <CheckCircle size={20} color="var(--jamb-green)" /> : <XCircle size={20} color="var(--error-color)" />}
                        <div>
                          <strong>Score: {scaledScore} / 400</strong>
                          <div style={{ fontSize: '13px', color: 'var(--jamb-green)', fontWeight: 'bold' }}>
                            {res.course || 'Global Exam'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(res.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: isPass ? 'var(--jamb-green)' : 'var(--error-color)', alignSelf: 'center', fontSize: '0.9rem', background: isPass ? 'rgba(10,127,63,0.1)' : 'rgba(211,47,47,0.1)', padding: '4px 10px', borderRadius: '15px' }}>
                        {isPass ? 'PASS' : 'FAIL'}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
