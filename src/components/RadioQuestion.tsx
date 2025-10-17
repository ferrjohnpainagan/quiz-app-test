interface RadioQuestionProps {
  id: string;
  question: string;
  choices: string[];
  value: number | null;
  onChange: (value: number) => void;
}

export default function RadioQuestion({ id, question, choices, value, onChange }: RadioQuestionProps) {
  return (
    <div>
      <p>{question}</p>
      {choices.map((choice, index) => (
        <div key={index}>
          <input
            type="radio"
            id={`${id}-${index}`}
            name={id}
            checked={value === index}
            onChange={() => onChange(index)}
          />
          <label htmlFor={`${id}-${index}`}>{choice}</label>
        </div>
      ))}
    </div>
  );
}
