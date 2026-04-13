import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { COURSE_COMBINATIONS, subjects as allSubjects } from '../data/QA';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      return setError("Please select your intended course of study");
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
        setSuccess(`Registration successful! Your Reg No is ${data.regNumber}. Redirecting to login...`);
        setTimeout(() => navigate('/login'), 3500);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const courseGroups = {
    "SCIENCE": ["Medicine", "Engineering", "Computer Science", "Pharmacy"],
    "COMMERCIAL": ["Accounting", "Business Administration", "Banking & Finance", "Marketing"],
    "ARTS": ["Law", "Mass Communication", "Theatre Arts", "International Relations"]
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="auth-card glass-panel animate-fade-in" style={{ maxWidth: '650px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <GraduationCap size={40} style={{ color: 'var(--jamb-green)', marginBottom: '10px' }} /> <br/>
          Candidate Portal Registration
        </h2>
        
        {error && <p style={{ color: 'white', background: 'var(--error-color)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'white', background: 'var(--jamb-green)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{success}</p>}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="input-group">
              <label>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="e.g. John" />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="e.g. Doe" />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
          </div>

          {/* COURSE SELECTOR */}
          <div className="input-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Select Intended Course of Study
              {course && <span style={{ fontSize: '0.8rem', color: 'var(--jamb-green)', fontWeight: 'bold' }}>Mapped!</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #ddd', appearance: 'none', background: 'white', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="">-- Choose a Course --</option>
                {Object.entries(courseGroups).map(([group, courses]) => (
                  <optgroup label={group} key={group}>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} />
            </div>
            
            {course && (
              <div style={{ marginTop: '12px', padding: '15px', background: 'rgba(10, 127, 63, 0.05)', borderRadius: '10px', border: '1px solid rgba(10, 127, 63, 0.2)', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--jamb-green)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Exam Subjects for {course}:
                </div>
                <div style={{ color: '#555', lineHeight: '1.4' }}>
                  {getSubjectNames(getSubjectsByCourse(course))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div className="input-group">
              <label>Create Login PIN</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="****" />
            </div>
            <div className="input-group">
              <label>Confirm PIN</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="****" />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={22} /> Register for Mock Exam
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--jamb-green)', fontWeight: 'bold', textDecoration: 'none' }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}
