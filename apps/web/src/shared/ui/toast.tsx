import { memo, useCallback } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { create } from 'zustand';

type ToastTone = 'success' | 'error';

type Toast = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

type ToastStore = {
  toasts: Toast[];
  notify: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  notify: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-4) }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export const ToastViewport = memo(function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const onDismiss = useCallback((id: string) => dismiss(id), [dismiss]);

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          {toast.tone === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <div>
            <strong>{toast.title}</strong>
            {toast.message ? <span>{toast.message}</span> : null}
          </div>
          <button className="icon-button tiny" type="button" onClick={() => onDismiss(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
});
