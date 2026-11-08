import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  text: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const config = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-mint',
    text: 'text-white',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger',
    text: 'text-white',
  },
  info: {
    icon: Info,
    bg: 'bg-brand',
    text: 'text-white',
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  const [leaving, setLeaving] = useState(false);
  const c = config[toast.kind];
  const Icon = c.icon;

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(() => onClose(toast.id), 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [toast.id, onClose]);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl ${c.bg} ${c.text} px-4 py-3 shadow-glow max-w-sm animate-toast-in ${
        leaving ? 'opacity-0 translate-y-[-8px] transition-all duration-300' : ''
      }`}
      role="status"
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{toast.text}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Закрити"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      <div className="flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onClose={onClose} />
          </div>
        ))}
      </div>
    </div>
  );
}
