import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoadingState({ label = 'Loading data from the backend…', className }) {
  return (
    <div
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700/70 bg-ink-900/40 px-6 py-10 text-center',
        className,
      )}
      role="status"
    >
      <Loader2 className="h-6 w-6 animate-spin text-electric-400" />
      <p className="text-sm text-ink-200">{label}</p>
      <p className="text-xs text-ink-500">Sample data is never shown while a request is in flight.</p>
    </div>
  );
}
