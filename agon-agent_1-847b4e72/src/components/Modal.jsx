import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="animate-slide-up relative m-0 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-ink-700 bg-ink-900 shadow-[0_40px_90px_-30px_rgba(2,8,23,0.95)] sm:m-6 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-ink-800 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-ink-50">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-ink-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
            aria-label="Close dialog"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-ink-800 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
