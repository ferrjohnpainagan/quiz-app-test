interface CheckboxQuestionProps {
  id: string;
  question: string;
  choices: string[];
  value: number[];
  onChange: (value: number[]) => void;
}

export default function CheckboxQuestion({ id, question, choices, value, onChange }: CheckboxQuestionProps) {
  const handleChange = (index: number) => {
    if (value.includes(index)) {
      onChange(value.filter((v) => v !== index));
    } else {
      onChange([...value, index]);
    }
  };

  return (
    <div>
      <p>{question}</p>
      {choices.map((choice, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`${id}-${index}`}
            checked={value.includes(index)}
            onChange={() => handleChange(index)}
          />
          <label htmlFor={`${id}-${index}`}>{choice}</label>
        </div>
      ))}
    </div>
  );
}
