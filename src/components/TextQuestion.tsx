interface TextQuestionProps {
  id: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextQuestion({ id, question, value, onChange }: TextQuestionProps) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-[#090C02] font-medium text-base sm:text-lg">
        {question}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
        className="w-full px-4 py-3 bg-white/80 border-2 border-[#DDE2C6] rounded-xl focus:ring-2 focus:ring-[#BBC5AA] focus:border-[#BBC5AA] outline-none transition-all duration-200 text-[#090C02] placeholder-[#090C02]/40"
      />
    </div>
  );
}
