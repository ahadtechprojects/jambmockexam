import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, LogOut, FileText, CheckCircle, XCircle, FlaskConical, Briefcase, Theater, List } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const BASE_URL = import.meta.env.VITE_API_URL;
    // Fetch all users
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

  const disciplineMap = {
    // SCIENCE
    "Medicine / Surgery": "SCIENCE",
    "Engineering": "SCIENCE",
    "Computer Science": "SCIENCE",
    "Pharmacy": "SCIENCE",
    // COMMERCIAL
    "Accounting": "COMMERCIAL",
    "Business Administration": "COMMERCIAL",
    "Banking & Finance": "COMMERCIAL",
    "Marketing": "COMMERCIAL",
    // ARTS
    "Law": "ARTS",
    "Mass Communication": "ARTS",
    "Theatre Arts": "ARTS",
    "International Relations": "ARTS"
  };

  const getDiscipline = (course) => disciplineMap[course] || 'OTHER';

  const filteredStudents = activeTab === 'ALL' 
    ? students 
    : students.filter(st => getDiscipline(st.course) === activeTab);

  const stats = {
    ALL: students.length,
    SCIENCE: students.filter(st => getDiscipline(st.course) === 'SCIENCE').length,
    COMMERCIAL: students.filter(st => getDiscipline(st.course) === 'COMMERCIAL').length,
    ARTS: students.filter(st => getDiscipline(st.course) === 'ARTS').length
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header className="app-header" style={{ background: '#0f172a' }}>
        <h1 style={{ fontSize: '1.25rem' }}><Shield size={24} /> Administrator Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Admin Mode</span>
          <button className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 15px' }} onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="main-container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
        
        {/* DISCIPLINE FILTER TABS */}
        <div className="glass-panel" style={{ padding: '0', background: 'white', marginBottom: '40px', overflow: 'hidden' }}>
          <div style={{ padding: '25px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
              <Users color="var(--jamb-green)" /> Candidate Distribution
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>Filter and monitor students based on their registered categories.</p>
          </div>
          
          <div style={{ display: 'flex', background: '#f8fafc', padding: '10px 20px', gap: '10px' }}>
            <TabButton icon={<List size={18} />} label="All Candidates" value="ALL" active={activeTab === 'ALL'} count={stats.ALL} onClick={() => setActiveTab('ALL')} />
            <TabButton icon={<FlaskConical size={18} />} label="Science" value="SCIENCE" active={activeTab === 'SCIENCE'} count={stats.SCIENCE} onClick={() => setActiveTab('SCIENCE')} />
            <TabButton icon={<Briefcase size={18} />} label="Commercial" value="COMMERCIAL" active={activeTab === 'COMMERCIAL'} count={stats.COMMERCIAL} onClick={() => setActiveTab('COMMERCIAL')} />
            <TabButton icon={<Theater size={18} />} label="Arts/Humanities" value="ARTS" active={activeTab === 'ARTS'} count={stats.ARTS} onClick={() => setActiveTab('ARTS')} />
          </div>

          <div style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Candidate Identity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Specific Course</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Exam Attempts</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(st => (
                  <tr key={st.id} className="animate-slide-in" style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #eef2f6' }}>
                    <td style={{ padding: '15px', borderRadius: '8px 0 0 8px' }}>
                      <div style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--jamb-green)', fontSize: '1rem' }}>{st.regNumber}</div>
                      <div style={{ fontWeight: '500', color: '#1e293b' }}>{st.firstName} {st.lastName}</div>
                    </td>
                    <td style={{ padding: '15px', color: '#475569' }}>
                      <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {st.course || 'Not Assigned'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: st.examsTaken > 0 ? 'rgba(10,127,63,0.1)' : '#f1f5f9', color: st.examsTaken > 0 ? 'var(--jamb-green)' : '#94a3b8', fontWeight: 'bold' }}>
                        {st.examsTaken || 0}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No students found in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXAM RECORDS LIST */}
        <div className="glass-panel" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
            <FileText color="var(--jamb-green)" /> Detailed Exam Performance
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '15px' }}>Candidate</th>
                  <th style={{ padding: '15px' }}>Course</th>
                  <th style={{ padding: '15px' }}>Result</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px' }}>Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map(res => {
                  const scaledScore = Math.round((res.score / res.total) * 400);
                  const isPass = scaledScore >= 200;
                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '15px' }}>
                         <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{res.firstName} {res.lastName}</div>
                         <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>{res.regNumber}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{res.course || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '800', color: isPass ? 'var(--jamb-green)' : 'var(--error-color)', fontSize: '1.2rem' }}>
                          {scaledScore}<span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal', marginLeft: '4px' }}>/ 400</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: '800', 
                          background: isPass ? 'rgba(10,127,63,0.1)' : 'rgba(211,47,47,0.1)',
                          color: isPass ? 'var(--jamb-green)' : 'var(--error-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(res.timestamp).toLocaleDateString()} <br/>
                        <span style={{ fontSize: '0.75rem' }}>{new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

function TabButton({ icon, label, active, count, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        background: active ? 'white' : 'transparent',
        color: active ? 'var(--jamb-green)' : '#64748b',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: active ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem'
      }}
    >
      {icon}
      <span>{label}</span>
      <span style={{ 
        marginLeft: '4px',
        background: active ? 'rgba(10,127,63,0.1)' : '#e2e8f0',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75rem'
      }}>
        {count}
      </span>
    </button>
  );
}
