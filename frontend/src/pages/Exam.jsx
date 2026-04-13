import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjects as rawSubjects } from '../data/QA';
import { AuthContext } from '../context/AuthContext';
import { Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

// Fisher-Yates Shuffle Utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[shuffled[i]]];
  }
  return shuffled;
};

export default function Exam() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shuffledSubjects, setShuffledSubjects] = useState([]);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Timer is global: 60 mins (3600s)
  const [globalTimeLeft, setGlobalTimeLeft] = useState(3600);
  
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and Shuffle on Mount
  useEffect(() => {
    const randomized = rawSubjects.map(sub => ({
      ...sub,
      questions: shuffleArray(sub.questions)
    }));
    setShuffledSubjects(randomized);
  }, []);

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
  }, [shuffledSubjects]); // Dependency on shuffledSubjects to ensure submitExam can clear interval correctly

  if (shuffledSubjects.length === 0) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Examination Interface...</div>;

  const currentSubject = shuffledSubjects[subjectIndex];
  const currentQuestion = currentSubject.questions[questionIndex];
  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  const handleNextSubject = () => {
    if (subjectIndex < shuffledSubjects.length - 1) {
      setSubjectIndex(prev => prev + 1);
      setQuestionIndex(0);
    } else {
      submitExam();
    }
  };

  const handleNextQuestion = () => {
    if (!hasAnsweredCurrent) return;
    if (questionIndex < currentSubject.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      handleNextSubject();
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    } else if (subjectIndex > 0) {
      setSubjectIndex(prev => prev - 1);
      setQuestionIndex(shuffledSubjects[subjectIndex - 1].questions.length - 1);
    }
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let score = 0;
    let total = 0;

    shuffledSubjects.forEach(sub => {
      sub.questions.forEach(q => {
        total++;
        if (answers[q.id] === q.answer) score++;
      });
    });

    try {
      const BASE_URL = import.meta.env.VITE_API_URL;
      await fetch(`${BASE_URL}/api/exam/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, total })
      });
      navigate('/results', { state: { score, total } });
    } catch (err) {
      navigate('/results', { state: { score, total } });
    }
  };

  const selectOption = (opt) => {
    setAnswers({ ...answers, [currentQuestion.id]: opt });
  };

  const isFirstQuestionGlobal = subjectIndex === 0 && questionIndex === 0;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      <header className="app-header" style={{ padding: '15px 30px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <GraduationCap /> JAMB CBT
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          <Clock color={globalTimeLeft < 300 ? '#ffb3b3' : 'white'} />
          <span style={{ color: globalTimeLeft < 300 ? '#ffb3b3' : 'white' }}>
            {Math.floor(globalTimeLeft / 60)}:{String(globalTimeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </header>

      <main className="main-container animate-fade-in" style={{ maxWidth: '850px', marginTop: '30px' }}>
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
                {questionIndex === currentSubject.questions.length - 1 && subjectIndex === shuffledSubjects.length - 1 
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
