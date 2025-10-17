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
              type="checkbox"
              id={`${id}-${index}`}
              checked={value.includes(index)}
              onChange={() => handleChange(index)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-700">{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
