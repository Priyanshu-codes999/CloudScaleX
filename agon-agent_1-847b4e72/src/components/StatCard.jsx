import { cn } from '../lib/utils';

const TONES = {
  blue: 'bg-electric-500/10 text-electric-300 ring-1 ring-inset ring-electric-500/25',
  cyan: 'bg-cyan-glow/10 text-cyan-glow ring-1 ring-inset ring-cyan-glow/25',
  green: 'bg-emerald-glow/10 text-emerald-glow ring-1 ring-inset ring-emerald-glow/25',
  violet: 'bg-[#8B7BFF]/10 text-[#A99BFF] ring-1 ring-inset ring-[#8B7BFF]/25',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'blue', loading = false }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/80 p-5 shadow-[0_18px_40px_-28px_rgba(2,8,23,0.9)] transition-colors hover:border-ink-600">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">{label}</p>
          {loading ? (
            <div className="mt-3.5 h-8 w-24 animate-pulse rounded-md bg-ink-800" />
          ) : (
            <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-ink-50 tabular-nums">
              {value}
            </p>
          )}
          {hint ? <p className="mt-2.5 text-xs leading-relaxed text-ink-400">{hint}</p> : null}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', TONES[tone] || TONES.blue)}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-electric-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
