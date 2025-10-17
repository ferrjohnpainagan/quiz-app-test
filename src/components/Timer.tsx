'use client';

import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/useQuizStore';

export default function Timer() {
  const { getTimeRemaining, submitQuiz } = useQuizStore();
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        submitQuiz();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining, submitQuiz]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const getStyles = () => {
    if (timeLeft <= 30000) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        animate: 'animate-pulse',
      };
    }
    if (timeLeft <= 60000) {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300',
        animate: '',
      };
    }
    return {
      bg: 'bg-[#DDE2C6]',
      text: 'text-[#090C02]',
      border: 'border-[#BBC5AA]',
      animate: '',
    };
  };

  const styles = getStyles();
  const showWarning = timeLeft <= 60000;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${styles.bg} border ${styles.border} ${styles.animate} shadow-sm`}>
      {showWarning && (
        <svg className={`w-5 h-5 ${styles.text}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      <svg className={`w-6 h-6 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`font-mono text-lg font-bold ${styles.text}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
