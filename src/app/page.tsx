'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientQuestion, Answer } from '@/types/quiz';
import QuizQuestion from '@/components/QuizQuestion';

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | number[]>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setSubmitting(true);

    const answerArray: Answer[] = Object.entries(answers).map(([id, value]) => ({
      id,
      value,
    }));

    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      });

      const data = await res.json();

      // Store results in sessionStorage to display on results page
      sessionStorage.setItem('quizResults', JSON.stringify(data));
      router.push('/results');
    } catch (err) {
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
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
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
