import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjects as rawSubjects } from '../data/QA';
import { AuthContext } from '../context/AuthContext';
import { Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

// Fisher-Yates Shuffle Utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Exam() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shuffledSubjects, setShuffledSubjects] = useState([]);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Timer per subject: 15 mins (900s)
  const [timeLeft, setTimeLeft] = useState(900);
  
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

  // Submit Exam Function - Wrapped in useCallback for use in Effects
  const submitExam = useCallback(async (finalSubjects = shuffledSubjects, finalAnswers = answers) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let score = 0;
    let total = 0;

    const subjectsToScore = finalSubjects.length > 0 ? finalSubjects : randomizedInitial();

    subjectsToScore.forEach(sub => {
      sub.questions.forEach(q => {
        total++;
        if (finalAnswers[q.id] === q.answer) score++;
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
  }, [isSubmitting, shuffledSubjects, answers, token, navigate]);

  // Helper for fail-safe scoring if state is lost
  const randomizedInitial = () => rawSubjects.map(sub => ({ ...sub, questions: shuffleArray(sub.questions) }));

  const handleNextSubject = useCallback(() => {
    if (subjectIndex < shuffledSubjects.length - 1) {
      setSubjectIndex(prev => prev + 1);
      setQuestionIndex(0);
      setTimeLeft(900); // Reset timer for next subject
    } else {
      submitExam();
    }
  }, [subjectIndex, shuffledSubjects, submitExam]);

  // Subject Timer Effect
  useEffect(() => {
    if (shuffledSubjects.length === 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextSubject(); // Auto move to next subject when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [subjectIndex, shuffledSubjects.length, isSubmitting, handleNextSubject]);

  if (shuffledSubjects.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '20px' }}>
        <GraduationCap size={48} className="animate-bounce" />
        <h2 style={{ letterSpacing: '2px' }}>INITIALIZING EXAM SERVER...</h2>
        <p style={{ opacity: 0.7 }}>Please wait while we randomize your questions</p>
      </div>
    );
  }

  const currentSubject = shuffledSubjects[subjectIndex];
  const currentQuestion = currentSubject?.questions[questionIndex];

  // Robust check for currentQuestion to prevent "g is undefined" error
  if (!currentQuestion) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Question...</div>;
  }

  const hasAnsweredCurrent = !!answers[currentQuestion.id];

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
      const prevSub = shuffledSubjects[subjectIndex - 1];
      setSubjectIndex(prev => prev - 1);
      setQuestionIndex(prevSub.questions.length - 1);
      // Note: We don't reset the timer when going BACK, as the user is "reviewing" their already completed or timed out subject?
      // Actually, per JAMB rules, you usually can't go back to a previous subject once it's closed, but here we allow review.
      // We will keep the current subject's timer.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '12px' }}>
          <Clock color={timeLeft < 120 ? '#ffb3b3' : 'white'} size={20} />
          <span style={{ color: timeLeft < 120 ? '#ffb3b3' : 'white' }}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </header>

      <main className="main-container animate-fade-in" style={{ maxWidth: '850px', marginTop: '30px' }}>
        <div className="glass-panel" style={{ overflow: 'visible' }}>
          <div style={{ background: 'var(--jamb-green)', color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', zIndex: 2, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Subject {subjectIndex + 1} of 4</span>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{currentSubject.name}</h2>
            </div>
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
