import { AlertTriangle, Eye, Server } from 'lucide-react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { formatINR, formatNumber } from '../services/api';
import { cn } from '../lib/utils';

function SkeletonRows({ rows = 4 }) {
  return (
    <div className="divide-y divide-ink-800">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-ink-800" />
          <div className="ml-auto h-4 w-14 animate-pulse rounded bg-ink-800" />
          <div className="h-4 w-14 animate-pulse rounded bg-ink-800" />
          <div className="h-4 w-20 animate-pulse rounded bg-ink-800" />
        </div>
      ))}
    </div>
  );
}

export default function WorkloadTable({ workloads, loading, error, onRetry, onSelect }) {
  if (loading) return <SkeletonRows />;

  if (error) {
    return (
      <ErrorState
        title="Workloads could not be loaded"
        description={error.message}
        onRetry={onRetry}
        retryLabel="Reload workloads"
      />
    );
  }

  if (!workloads.length) {
    return (
      <EmptyState
        icon={Server}
        title="No workloads registered yet"
        description="Register your first workload using the form. Every record shown here is returned by GET /api/v1/workloads — nothing is preloaded."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink-800 text-[10px] uppercase tracking-[0.14em] text-ink-500">
            <th scope="col" className="px-5 py-3.5 font-medium">Application</th>
            <th scope="col" className="px-3 py-3.5 font-medium">CPU</th>
            <th scope="col" className="px-3 py-3.5 font-medium">RAM</th>
            <th scope="col" className="px-3 py-3.5 font-medium">Expected Users</th>
            <th scope="col" className="px-3 py-3.5 font-medium">Monthly Budget</th>
            <th scope="col" className="px-5 py-3.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-800/80">
          {workloads.map((workload, index) => (
            <tr
              key={workload.id ?? index}
              className="group transition-colors hover:bg-ink-850/60"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-[11px] font-semibold text-electric-300">
                    {workload.applicationName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-50">{workload.applicationName}</p>
                    <p className="text-[11px] text-ink-500">
                      {workload.id === null ? 'ID unavailable' : `Workload #${workload.id}`}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 text-sm tabular-nums text-ink-200">
                {workload.cpuCores === null ? '—' : `${workload.cpuCores} cores`}
              </td>
              <td className="px-3 py-4 text-sm tabular-nums text-ink-200">
                {workload.ramGb === null ? '—' : `${workload.ramGb} GB`}
              </td>
              <td className="px-3 py-4 text-sm tabular-nums text-ink-200">
                {formatNumber(workload.expectedUsers)}
              </td>
              <td className="px-3 py-4 text-sm tabular-nums text-ink-200">
                {formatINR(workload.monthlyBudget)}
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(workload)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors',
                    'hover:border-electric-500/60 hover:text-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400',
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 border-t border-ink-800 px-5 py-3 text-[11px] text-ink-500">
        <AlertTriangle className="h-3.5 w-3.5" />
        Showing {workloads.length} workload{workloads.length === 1 ? '' : 's'} returned by the backend.
      </div>
    </div>
  );
}
