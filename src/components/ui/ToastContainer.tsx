import React from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { CheckCircle2, AlertCircle, Info, Trophy, Flame, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useCricketStore((state) => state.toasts);
  const removeToast = useCricketStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2">
      {toasts.map((toast) => {
        let borderClass = 'border-[#2a2a2e] bg-[#1a1d23]/95 text-[#e0e0e0] shadow-xl shadow-black/50';
        let icon = <Info className="w-5 h-5 text-[#29b6f6] shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-[#00c853]/60 bg-[#1a1d23]/95 text-white shadow-xl shadow-black/50';
          icon = <CheckCircle2 className="w-5 h-5 text-[#00c853] shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-[#d50000]/60 bg-[#1a1d23]/95 text-white shadow-xl shadow-black/50';
          icon = <AlertCircle className="w-5 h-5 text-[#ff5252] shrink-0" />;
        } else if (toast.type === 'boundary') {
          borderClass = 'border-[#ffab00]/60 bg-[#1a1d23]/95 text-white shadow-xl shadow-black/50';
          icon = <Flame className="w-5 h-5 text-[#ffab00] shrink-0 animate-pulse" />;
        } else if (toast.type === 'wicket') {
          borderClass = 'border-[#d50000]/70 bg-[#1a1d23]/95 text-white shadow-xl shadow-black/50';
          icon = <Trophy className="w-5 h-5 text-[#ff5252] shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 transform translate-y-0 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-[#909090] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#909090] hover:text-white rounded-lg hover:bg-[#25282e] transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
