import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjects } from '../data/QA';
import { AuthContext } from '../context/AuthContext';
import { Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Exam() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [subjectIndex, setSubjectIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Timer is global: 15 mins (900s)
  const [globalTimeLeft, setGlobalTimeLeft] = useState(900);
  
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSubject = subjects[subjectIndex];
  const currentQuestion = currentSubject.questions[questionIndex];

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Global Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(); // Auto submit when global timer hits 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  const handleNextSubject = () => {
    if (subjectIndex < subjects.length - 1) {
      setSubjectIndex(prev => prev + 1);
      setQuestionIndex(0);
    } else {
      submitExam();
    }
  };

  const handleNextQuestion = () => {
    // Cannot proceed if not answered
    if (!hasAnsweredCurrent) return;

    if (questionIndex < currentSubject.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      // Reached the end of questions for this subject
      handleNextSubject();
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    } else if (subjectIndex > 0) {
      // If we are at the very first question of a subject, allow navigating back to the previous subject's last question
      setSubjectIndex(prev => prev - 1);
      setQuestionIndex(subjects[subjectIndex - 1].questions.length - 1);
    }
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let score = 0;
    let total = 0;

    subjects.forEach(sub => {
      sub.questions.forEach(q => {
        total++;
        if (answers[q.id] === q.answer) score++;
      });
    });

    try {
      await fetch('http://localhost:5000/api/exam/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, total })
      });
      navigate('/results', { state: { score, total } });
    } catch (err) {
      alert('Failed to submit results. Auto-redirecting.');
      navigate('/results', { state: { score, total } });
      setIsSubmitting(false);
    }
  };

  const selectOption = (opt) => {
    setAnswers({ ...answers, [currentQuestion.id]: opt });
  };

  // Prevent back navigation to previous question if we are on the very first question of the exam
  const isFirstQuestionGlobal = subjectIndex === 0 && questionIndex === 0;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      <header className="app-header" style={{ padding: '15px 30px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <GraduationCap /> JAMB CBT
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          <Clock color={globalTimeLeft < 120 ? '#ffb3b3' : 'white'} />
          <span style={{ color: globalTimeLeft < 120 ? '#ffb3b3' : 'white' }}>
            {Math.floor(globalTimeLeft / 60)}:{String(globalTimeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </header>

      <main className="main-container animate-fade-in" style={{ maxWidth: '850px', marginTop: '30px' }}>
        
        {/* Strict Exam Container */}
        <div className="glass-panel" style={{ overflow: 'visible' }}>
          
          <div style={{ background: 'var(--jamb-green)', color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', zIndex: 2, position: 'relative' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{currentSubject.name}</h2>
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: '6px 15px', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '600' }}>
              Q {questionIndex + 1} of {currentSubject.questions.length}
            </div>
          </div>

          <div style={{ padding: '40px 30px' }}>
            <p style={{ fontSize: '1.3rem', marginBottom: '35px', fontWeight: '500', lineHeight: '1.6', color: 'var(--jamb-dark)' }}>
              {currentQuestion.question}
            </p>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {currentQuestion.options.map((opt, i) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <div 
                    key={i} 
                    onClick={() => selectOption(opt)}
                    style={{
                      padding: '16px 20px',
                      border: `2px solid ${isSelected ? 'var(--jamb-green)' : 'rgba(255,255,255,0.6)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(230, 255, 230, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.2s ease',
                      fontWeight: isSelected ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      boxShadow: isSelected ? '0 4px 10px rgba(10, 127, 63, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      border: `2px solid ${isSelected ? 'var(--jamb-green)' : '#aaa'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'var(--jamb-green)' : 'transparent',
                      color: isSelected ? 'white' : 'inherit',
                      fontWeight: 'bold'
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '45px', paddingTop: '25px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              
              <button 
                className="btn btn-secondary" 
                onClick={handlePrevQuestion}
                disabled={isFirstQuestionGlobal}
                style={{ padding: '12px 25px' }}
              >
                <ChevronLeft size={20} /> Previous
              </button>

              <button 
                className="btn" 
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCurrent}
                style={{ 
                  background: hasAnsweredCurrent ? 'var(--jamb-green)' : '#999',
                  cursor: hasAnsweredCurrent ? 'pointer' : 'not-allowed',
                  padding: '12px 30px'
                }}
              >
                {questionIndex === currentSubject.questions.length - 1 && subjectIndex === subjects.length - 1 
                  ? 'Submit Exam' 
                  : (questionIndex === currentSubject.questions.length - 1 ? 'Next Subject' : 'Next')}
                <ChevronRight size={20} />
              </button>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
