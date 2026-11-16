import { Cloud, Server, ShieldCheck, Target } from 'lucide-react';
import { formatINR, formatNumber } from '../services/api';
import { cn } from '../lib/utils';

function RequirementTile({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-950/50 px-4 py-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-ink-50">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-ink-400">{sub}</p> : null}
    </div>
  );
}

export default function PlacementCard({ placement, workload }) {
  const isLocal = placement.platform === 'LOCAL';
  const isAws = placement.platform === 'AWS';
  const accent = isLocal
    ? { text: 'text-electric-300', chip: 'bg-electric-500/12 text-electric-300 ring-electric-500/30', Icon: Server }
    : isAws
      ? { text: 'text-cyan-glow', chip: 'bg-cyan-glow/12 text-cyan-glow ring-cyan-glow/30', Icon: Cloud }
      : { text: 'text-ink-100', chip: 'bg-ink-800 text-ink-200 ring-ink-600', Icon: Target };
  const Icon = accent.Icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/80">
      <div
        className={cn(
          'relative border-b border-ink-800 px-6 py-6',
          isLocal
            ? 'bg-gradient-to-r from-electric-500/[0.12] via-transparent to-transparent'
            : isAws
              ? 'bg-gradient-to-r from-cyan-glow/[0.12] via-transparent to-transparent'
              : '',
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset', accent.chip)}>
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">Recommended Platform</p>
            <p className={cn('mt-1 text-2xl font-semibold tracking-tight', accent.text)}>
              {placement.platformLabel}
            </p>
          </div>
          <span className={cn('rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset', accent.chip)}>
            {placement.platform === 'LOCAL' ? 'Local' : placement.platform === 'AWS' ? 'AWS' : 'Engine output'}
          </span>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-950/50 px-4 py-4">
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-glow" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-300">Recommendation reason</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-100">
              {placement.reason || 'The placement engine did not return a reason for this recommendation.'}
            </p>
            <p className="mt-2 text-[11px] text-ink-500">
              Produced by the transparent rule-based placement engine — not a machine-learning prediction.
            </p>
          </div>
        </div>

        {workload ? (
          <div className="mt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-500">Workload requirements</p>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <RequirementTile
                label="CPU Cores"
                value={workload.cpuCores === null ? '—' : workload.cpuCores}
                sub="Requested compute"
              />
              <RequirementTile
                label="RAM"
                value={workload.ramGb === null ? '—' : `${workload.ramGb} GB`}
                sub="Requested memory"
              />
              <RequirementTile label="Expected Users" value={formatNumber(workload.expectedUsers)} sub="Concurrent scale" />
              <RequirementTile label="Monthly Budget" value={formatINR(workload.monthlyBudget)} sub="INR per month" />
            </div>
          </div>
        ) : null}

        <details className="group mt-6 rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-ink-300 transition-colors hover:text-ink-100">
            View raw placement engine response
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-ink-950 p-4 text-[11px] leading-relaxed text-ink-300">
            {JSON.stringify(placement.raw, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
