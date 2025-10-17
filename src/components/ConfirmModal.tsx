interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColor = type === 'warning' ? 'text-amber-600' : 'text-[#A72608]';
  const iconBg = type === 'warning' ? 'bg-amber-100' : 'bg-[#DDE2C6]';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-[#DDE2C6] transform transition-all">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center`}>
              {type === 'warning' ? (
                <svg className={`w-8 h-8 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className={`w-8 h-8 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#090C02] mb-3">{title}</h3>
            <div className="text-[#090C02]/70 leading-relaxed text-left space-y-2">
              {message.split('\n').map((line, index) => {
                if (line.trim() === '') return null;

                // Parse markdown-style bold (**text**)
                const parts = line.split(/(\*\*.*?\*\*)/g);
                const rendered = parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold text-[#090C02]">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });

                return <p key={index}>{rendered}</p>;
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {cancelText && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-[#DDE2C6] text-[#090C02] font-medium rounded-xl hover:bg-[#DDE2C6]/20 active:scale-[0.98] transition-all duration-200"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold rounded-xl hover:from-[#8B1F07] hover:to-[#6B1505] active:scale-[0.98] transition-all duration-200 shadow-lg"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
