import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, LogOut, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Fetch all users
    const BASE_URL = import.meta.env.VITE_API_URL;
    fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setStudents(data);
      })
      .catch(console.error);

    // Fetch all results
    fetch(`${BASE_URL}/api/admin/results`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setResults(data);
      })
      .catch(console.error);

  }, [user, navigate, token]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header className="app-header" style={{ background: '#1e293b' }}>
        <h1><Shield /> Administrator Portal</h1>
        <button className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => { logout(); navigate('/login'); }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main className="main-container animate-fade-in" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2فر', gap: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '25px', background: 'white' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#334155' }}>
              <Users /> All Candidates
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Reg No</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Exams</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(st => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', fontFamily: 'monospace', color: 'var(--jamb-green)' }}>{st.regNumber}</td>
                      <td style={{ padding: '12px' }}>{st.firstName} {st.lastName}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{st.email}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{st.examsTaken || 0}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No candidates found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '25px', background: 'white' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#334155' }}>
              <FileText /> Detailed Exam Records
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Candidate Name</th>
                    <th style={{ padding: '12px' }}>Reg No</th>
                    <th style={{ padding: '12px' }}>Score Ratio</th>
                    <th style={{ padding: '12px' }}>Percentage</th>
                    <th style={{ padding: '12px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(res => {
                    const pct = Math.round((res.score / res.total) * 100);
                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{res.firstName} {res.lastName}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>{res.regNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{res.score} / {res.total}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: pct >= 50 ? 'var(--jamb-green)' : 'var(--error-color)' }}>
                          {pct}%
                        </td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {new Date(res.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {results.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No exam records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
