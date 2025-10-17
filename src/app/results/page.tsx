'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GradeResponse } from '@/types/quiz';

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<GradeResponse | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('quizResults');
    if (data) {
      setResults(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!results) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Quiz Results</h1>
      <h2>
        Score: {results.score} / {results.total}
      </h2>
      <div>
        <h3>Results by Question:</h3>
        {results.results.map((result) => (
          <div key={result.id}>
            Question {result.id}: {result.correct ? '✓ Correct' : '✗ Incorrect'}
          </div>
        ))}
      </div>
      <button onClick={() => router.push('/')}>Retake Quiz</button>
    </div>
  );
}
