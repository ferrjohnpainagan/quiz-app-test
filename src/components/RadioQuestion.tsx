interface RadioQuestionProps {
  id: string;
  question: string;
  choices: string[];
  value: number | null;
  onChange: (value: number) => void;
}

export default function RadioQuestion({ id, question, choices, value, onChange }: RadioQuestionProps) {
  return (
    <div className="space-y-3">
      <p className="text-slate-900 font-medium">{question}</p>
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <label
            key={index}
            htmlFor={`${id}-${index}`}
            className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="radio"
              id={`${id}-${index}`}
              name={id}
              checked={value === index}
              onChange={() => onChange(index)}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-700">{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
