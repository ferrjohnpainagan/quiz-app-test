// Question types per requirements
export type QuestionType = 'text' | 'radio' | 'checkbox';

// Text question - user types their answer
export interface TextQuestion {
  id: string;
  type: 'text';
  question: string;
  correctText: string;
}

// Radio question - single choice
export interface RadioQuestion {
  id: string;
  type: 'radio';
  question: string;
  choices: string[];
  correctIndex: number;
}

// Checkbox question - multiple choices
export interface CheckboxQuestion {
  id: string;
  type: 'checkbox';
  question: string;
  choices: string[];
  correctIndexes: number[];
}

// Union of all question types
export type Question = TextQuestion | RadioQuestion | CheckboxQuestion;

// Client-facing question types (without answer keys for security)
export type ClientQuestion =
  | Omit<TextQuestion, 'correctText'>
  | Omit<RadioQuestion, 'correctIndex'>
  | Omit<CheckboxQuestion, 'correctIndexes'>;

// Response from GET /api/quiz
export interface QuizResponse {
  questions: ClientQuestion[];
}
