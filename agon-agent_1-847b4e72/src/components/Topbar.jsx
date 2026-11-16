import { Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../lib/utils';

function ConnectionPill({ connection }) {
  const status = connection.status;
  const tone =
    status === 'online'
      ? { dot: 'bg-emerald-glow', text: 'text-emerald-glow', label: 'Backend connected' }
      : status === 'offline'
        ? { dot: 'bg-rose-glow', text: 'text-rose-glow', label: 'Backend offline' }
        : { dot: 'bg-amber-glow', text: 'text-amber-glow', label: 'Checking backend' };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850/80 px-3 py-1.5 text-xs font-medium',
        tone.text,
      )}
      title={connection.message}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', tone.dot)} />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', tone.dot)} />
      </span>
      <span className="hidden sm:inline">{tone.label}</span>
      {connection.latencyMs !== null && status === 'online' ? (
        <span className="hidden text-ink-400 md:inline">· {connection.latencyMs} ms</span>
      ) : null}
    </div>
  );
}

export default function Topbar({ pageTitle, onOpenMenu }) {
  const { connection, refreshAll, refreshing } = useData();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg border border-ink-700 p-2 text-ink-200 transition-colors hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-ink-50">{pageTitle}</p>
          <p className="hidden text-[11px] text-ink-400 sm:block">
            Workload placement & cost optimisation console
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ConnectionPill connection={connection} />

          <button
            type="button"
            onClick={refreshAll}
            disabled={refreshing}
            className={cn(
              'flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850/80 px-3.5 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-electric-500/50 hover:text-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400',
              refreshing && 'cursor-wait opacity-70',
            )}
            aria-label="Refresh backend data"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing' : 'Refresh'}</span>
          </button>

          <div
            className="flex items-center gap-2.5 rounded-full border border-ink-700 bg-ink-850/80 py-1 pl-1 pr-3"
            title="User profile placeholder — authentication is not part of this build"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-electric-500 to-cyan-glow text-[11px] font-semibold text-ink-950">
              OP
            </span>
            <span className="hidden text-xs font-medium text-ink-200 md:inline">Local Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
