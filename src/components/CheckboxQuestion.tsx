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
    <div className="space-y-4">
      <div>
        <p className="text-[#090C02] font-medium text-base sm:text-lg mb-2">{question}</p>
        <p className="text-[#090C02]/60 text-sm">Select all that apply</p>
      </div>
      <div className="space-y-3">
        {choices.map((choice, index) => (
          <label
            key={index}
            htmlFor={`${id}-${index}`}
            className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              value.includes(index)
                ? 'bg-[#DDE2C6]/40 border-[#BBC5AA] shadow-sm'
                : 'bg-white/60 border-[#DDE2C6] hover:border-[#BBC5AA] hover:bg-[#DDE2C6]/20'
            }`}
          >
            <input
              type="checkbox"
              id={`${id}-${index}`}
              checked={value.includes(index)}
              onChange={() => handleChange(index)}
              className="w-5 h-5 text-[#A72608] rounded focus:ring-2 focus:ring-[#BBC5AA] cursor-pointer mt-0.5 flex-shrink-0"
            />
            <span className="text-[#090C02]/90 leading-relaxed">{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
