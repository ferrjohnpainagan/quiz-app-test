import { ClientQuestion } from '@/types/quiz';
import TextQuestion from './TextQuestion';
import RadioQuestion from './RadioQuestion';
import CheckboxQuestion from './CheckboxQuestion';

interface QuizQuestionProps {
  question: ClientQuestion;
  value: string | number | number[] | null;
  onChange: (value: string | number | number[]) => void;
}

export default function QuizQuestion({ question, value, onChange }: QuizQuestionProps) {
  if (question.type === 'text') {
    return (
      <TextQuestion
        id={question.id}
        question={question.question}
        value={value as string}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'radio') {
    return (
      <RadioQuestion
        id={question.id}
        question={question.question}
        choices={question.choices}
        value={value as number | null}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'checkbox') {
    return (
      <CheckboxQuestion
        id={question.id}
        question={question.question}
        choices={question.choices}
        value={value as number[]}
        onChange={onChange}
      />
    );
  }

  return null;
}
