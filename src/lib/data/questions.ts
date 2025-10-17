import { Question } from '@/types/quiz';

export const questions: Question[] = [
  {
    id: '1',
    type: 'text',
    question: 'What does ICAO stand for?',
    correctText: 'International Civil Aviation Organization',
  },
  {
    id: '2',
    type: 'text',
    question: 'What is the standard cruising altitude for most commercial jets in feet?',
    correctText: '35000',
  },
  {
    id: '3',
    type: 'text',
    question: 'What does VFR stand for?',
    correctText: 'Visual Flight Rules',
  },
  {
    id: '4',
    type: 'radio',
    question: 'What is the maximum speed limit below 10,000 feet in the US?',
    choices: ['200 knots', '250 knots', '300 knots', '350 knots'],
    correctIndex: 1,
  },
  {
    id: '5',
    type: 'radio',
    question: 'Which aircraft manufacturer produces the 737?',
    choices: ['Airbus', 'Boeing', 'Bombardier', 'Embraer'],
    correctIndex: 1,
  },
  {
    id: '6',
    type: 'radio',
    question: 'What color are the recorders (black boxes) actually painted?',
    choices: ['Black', 'Orange', 'Yellow', 'Red'],
    correctIndex: 1,
  },
  {
    id: '7',
    type: 'radio',
    question: 'What is the phonetic alphabet for the letter "A"?',
    choices: ['Alpha', 'Able', 'Adam', 'Apple'],
    correctIndex: 0,
  },
  {
    id: '8',
    type: 'checkbox',
    question: 'Which of these are types of aircraft engines?',
    choices: ['Turbofan', 'Piston', 'Turboprop', 'Diesel', 'Jet'],
    correctIndexes: [0, 1, 2, 4],
  },
  {
    id: '9',
    type: 'checkbox',
    question: 'Select all instruments found in a basic aircraft cockpit:',
    choices: ['Altimeter', 'Speedometer', 'Airspeed Indicator', 'Tachometer', 'Attitude Indicator'],
    correctIndexes: [0, 2, 4],
  },
  {
    id: '10',
    type: 'checkbox',
    question: 'Which of these are major aircraft manufacturers?',
    choices: ['Boeing', 'Tesla', 'Airbus', 'Ford', 'Embraer'],
    correctIndexes: [0, 2, 4],
  },
];
