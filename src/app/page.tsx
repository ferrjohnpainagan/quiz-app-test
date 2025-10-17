'use client';

import { useState, useEffect } from 'react';
import { ClientQuestion } from '@/types/quiz';
import QuizQuestion from '@/components/QuizQuestion';

export default function Home() {
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | number[]>>({});

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load quiz');
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (id: string, value: string | number | number[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Aviation Quiz</h1>
      {questions.map((question) => (
        <QuizQuestion
          key={question.id}
          question={question}
          value={answers[question.id] || (question.type === 'checkbox' ? [] : '')}
          onChange={(value) => handleAnswerChange(question.id, value)}
        />
      ))}
    </div>
  );
}
