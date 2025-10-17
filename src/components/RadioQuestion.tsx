interface RadioQuestionProps {
  id: string;
  question: string;
  choices: string[];
  value: number | null;
  onChange: (value: number) => void;
}

export default function RadioQuestion({ id, question, choices, value, onChange }: RadioQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-[#090C02] font-medium text-base sm:text-lg">{question}</p>
      <div className="space-y-3">
        {choices.map((choice, index) => (
          <label
            key={index}
            htmlFor={`${id}-${index}`}
            className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              value === index
                ? 'bg-[#DDE2C6]/40 border-[#BBC5AA] shadow-sm'
                : 'bg-white/60 border-[#DDE2C6] hover:border-[#BBC5AA] hover:bg-[#DDE2C6]/20'
            }`}
          >
            <input
              type="radio"
              id={`${id}-${index}`}
              name={id}
              checked={value === index}
              onChange={() => onChange(index)}
              className="w-5 h-5 text-[#A72608] focus:ring-2 focus:ring-[#BBC5AA] cursor-pointer mt-0.5 flex-shrink-0"
            />
            <span className="text-[#090C02]/90 leading-relaxed">{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
