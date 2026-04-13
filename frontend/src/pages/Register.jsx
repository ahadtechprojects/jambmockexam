import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, GraduationCap, CheckCircle2, FlaskConical, Briefcase, Theater } from 'lucide-react';
import { COURSE_COMBINATIONS, subjects as allSubjects } from '../data/QA';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // New States for Multi-Step Course Selector
  const [activeDiscipline, setActiveDiscipline] = useState('SCIENCE'); 
  const [course, setCourse] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const getSubjectsByCourse = (courseName) => {
    return COURSE_COMBINATIONS[courseName] || COURSE_COMBINATIONS["Default"];
  };

  const getSubjectNames = (ids) => {
    return ids.map(id => allSubjects.find(s => s.id === id)?.name).join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError("PINs do not match");
    }

    if (!course) {
      return setError("Please select a course to continue");
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password, 
          course,
          subjects: getSubjectsByCourse(course)
        }) 
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Registration successful! Your Reg No is ${data.regNumber}. Redirecting...`);
        setTimeout(() => navigate('/login'), 3500);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const courseGroups = {
    "SCIENCE": {
      icon: <FlaskConical size={24} />,
      label: "SCIENCE",
      courses: ["Medicine / Surgery", "Engineering", "Computer Science", "Pharmacy"]
    },
    "COMMERCIAL": {
      icon: <Briefcase size={24} />,
      label: "COMMERCIAL",
      courses: ["Accounting", "Business Administration", "Banking & Finance", "Marketing"]
    },
    "ARTS": {
      icon: <Theater size={24} />,
      label: "ARTS / HUMANITIES",
      courses: ["Law", "Mass Communication", "Theatre Arts", "International Relations"]
    }
  };

  return (
    <div className="auth-container" style={{ padding: '60px 20px' }}>
      <div className="auth-card glass-panel animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', gap: '15px' }}>
          <GraduationCap size={44} style={{ color: 'var(--jamb-green)' }} />
          Candidate Registration
        </h2>
        
        {error && <p style={{ color: 'white', background: 'var(--error-color)', padding: '12px', borderRadius: '10px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
        {success && <p style={{ color: 'white', background: 'var(--jamb-green)', padding: '18px', borderRadius: '10px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(10,127,63,0.2)' }}>{success}</p>}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
            <div className="input-group">
              <label>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '35px' }}>
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
          </div>

          {/* NEXT LEVEL COURSE SELECTOR */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--jamb-dark)', marginBottom: '20px', display: 'block' }}>
              Choose Your Intended Discipline & Course
            </label>
            
            <div className="discipline-tabs">
              {Object.entries(courseGroups).map(([key, group]) => (
                <div 
                  key={key}
                  className={`discipline-tab ${activeDiscipline === key ? 'active' : ''}`}
                  onClick={() => { setActiveDiscipline(key); setCourse(''); }}
                >
                  {group.icon}
                  <span>{group.label}</span>
                </div>
              ))}
            </div>

            <div className="course-grid animate-slide-in" key={activeDiscipline}>
              {courseGroups[activeDiscipline].courses.map(c => (
                <div 
                  key={c}
                  className={`course-card ${course === c ? 'active' : ''}`}
                  onClick={() => setCourse(c)}
                >
                  {c}
                </div>
              ))}
            </div>

            {course && (
              <div style={{ padding: '20px', background: 'rgba(10, 127, 63, 0.08)', borderRadius: '15px', border: '2px dashed var(--jamb-green)', marginTop: '10px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--jamb-green)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem' }}>
                  <CheckCircle2 /> Subject Combination for {course}:
                </div>
                <div style={{ color: '#444', fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' }}>
                  {getSubjectNames(getSubjectsByCourse(course))}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
                   *These subjects will be automatically assigned to your exam battery.
                </p>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' }}>
            <div className="input-group">
              <label>Login PIN (4-6 Digits)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="****" />
            </div>
            <div className="input-group">
              <label>Confirm PIN</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="****" />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', padding: '22px', fontSize: '1.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(10,127,63,0.2)' }}>
            <UserPlus size={24} /> Create Account & Start Mock
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '35px', color: '#666', fontSize: '1.05rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--jamb-green)', fontWeight: 'bold', textDecoration: 'none' }}>Log in to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
