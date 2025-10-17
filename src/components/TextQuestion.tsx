interface TextQuestionProps {
  id: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextQuestion({ id, question, value, onChange }: TextQuestionProps) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-slate-900 font-medium">
        {question}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      />
    </div>
  );
}
