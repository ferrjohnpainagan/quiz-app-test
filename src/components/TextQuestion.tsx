interface TextQuestionProps {
  id: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextQuestion({ id, question, value, onChange }: TextQuestionProps) {
  return (
    <div>
      <label htmlFor={id}>{question}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
