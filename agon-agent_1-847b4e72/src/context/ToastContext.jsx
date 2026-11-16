import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

const TYPE_STYLES = {
  success: {
    icon: CheckCircle2,
    accent: 'border-l-emerald-glow',
    iconClass: 'text-emerald-glow',
  },
  error: {
    icon: AlertTriangle,
    accent: 'border-l-rose-glow',
    iconClass: 'text-rose-glow',
  },
  info: {
    icon: Info,
    accent: 'border-l-electric-400',
    iconClass: 'text-electric-300',
  },
};

let toastSeed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ type = 'info', title = '', message = '', duration = 6000 }) => {
      const id = ++toastSeed;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={cn(
                'toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-700 border-l-2 bg-ink-850/95 p-4 shadow-[0_24px_48px_-24px_rgba(2,8,23,0.95)] backdrop-blur',
                style.accent,
              )}
            >
              <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', style.iconClass)} strokeWidth={2} />
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className="text-sm font-semibold text-ink-50">{toast.title}</p>
                ) : null}
                {toast.message ? (
                  <p className="mt-1 break-words text-xs leading-relaxed text-ink-300">{toast.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-700/60 hover:text-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
