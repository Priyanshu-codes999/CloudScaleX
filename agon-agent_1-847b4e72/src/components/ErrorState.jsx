import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ErrorState({
  title = 'Backend request failed',
  description,
  onRetry,
  retryLabel = 'Retry',
  className,
}) {
  return (
    <div
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-glow/25 bg-rose-glow/[0.06] px-6 py-10 text-center',
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-glow/30 bg-rose-glow/10 text-rose-glow">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-50">{title}</p>
        {description ? (
          <p className="mx-auto mt-1.5 max-w-lg break-words text-xs leading-relaxed text-ink-300">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-850 px-4 py-2 text-xs font-medium text-ink-100 transition-colors hover:border-electric-500/60 hover:text-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
