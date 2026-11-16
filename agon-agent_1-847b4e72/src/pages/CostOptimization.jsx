import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Coins, Loader2, Server } from 'lucide-react';
import { useData } from '../context/DataContext';
import CostComparison from '../components/CostComparison';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { fetchCost } from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export default function CostOptimization() {
  const { workloads, workloadsLoading, workloadsError, refreshWorkloads } = useData();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState(queryId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const autoRan = useRef(false);

  const selectedWorkload = useMemo(
    () => workloads.find((w) => String(w.id) === String(selectedId)) || null,
    [workloads, selectedId],
  );

  const compare = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const cost = await fetchCost(id);
      if (!cost) {
        setError({ message: 'The cost engine returned an empty comparison for this workload.' });
      } else {
        setResult(cost);
      }
    } catch (err) {
      setError(err);
      notify({ type: 'error', title: 'Cost comparison failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!queryId || autoRan.current || workloadsLoading) return;
    const match = workloads.find((w) => String(w.id) === String(queryId));
    if (match) {
      autoRan.current = true;
      setSelectedId(String(match.id));
      compare(match.id);
    }
  }, [queryId, workloads, workloadsLoading]);

  const handleSelect = (value) => {
    setSelectedId(value);
    setResult(null);
    setError(null);
    if (value) setSearchParams({ id: value }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-50 sm:text-2xl">Cost Optimization</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-300">
          Compare the estimated monthly cost of running a workload on local infrastructure versus AWS Cloud.
          Every figure shown here is returned by the backend's demonstration pricing model.
        </p>
      </div>

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
        <label htmlFor="cost-workload" className="text-xs font-medium text-ink-200">
          Workload to compare
        </label>
        <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Server className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <select
              id="cost-workload"
              value={selectedId}
              onChange={(event) => handleSelect(event.target.value)}
              disabled={workloadsLoading || loading}
              className="w-full appearance-none rounded-xl border border-ink-700 bg-ink-950/60 py-3 pl-10 pr-10 text-sm text-ink-100 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20 disabled:opacity-60"
            >
              <option value="">Select a workload…</option>
              {workloads.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.applicationName} {w.id === null ? '' : `· #${w.id}`}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-ink-500" />
          </div>
          <button
            type="button"
            onClick={() => compare(selectedId)}
            disabled={!selectedId || loading}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl bg-electric-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-electric-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-300',
              (!selectedId || loading) && 'cursor-not-allowed opacity-60',
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
            {loading ? 'Comparing…' : 'Compare costs'}
          </button>
        </div>
        <p className="mt-2.5 text-[11px] text-ink-500">
          Endpoint: <span className="font-mono text-ink-400">GET /api/v1/cost/{'{id}'}</span> · illustrative
          estimates only, not actual AWS quotations.
        </p>
      </section>

      {workloadsLoading ? <LoadingState label="Loading registered workloads…" /> : null}

      {!workloadsLoading && workloadsError ? (
        <ErrorState
          title="Workloads could not be loaded"
          description={workloadsError.message}
          onRetry={refreshWorkloads}
          retryLabel="Reload workloads"
        />
      ) : null}

      {!workloadsLoading && !workloadsError && workloads.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No workloads available for comparison"
          description="Cost comparison needs at least one registered workload. No sample records are ever shown."
          action={
            <Link
              to="/workloads"
              className="inline-flex items-center gap-2 rounded-full border border-electric-500/50 bg-electric-500/10 px-4 py-2 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/20"
            >
              Register a workload <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      ) : null}

      {loading ? <LoadingState label="The cost engine is preparing the comparison…" /> : null}

      {error && !loading ? (
        <ErrorState
          title="Cost comparison failed"
          description={error.message}
          onRetry={() => compare(selectedId)}
          retryLabel="Compare again"
        />
      ) : null}

      {result && !loading ? <CostComparison cost={result} workload={selectedWorkload} /> : null}

      {!loading && !error && !result && workloads.length > 0 ? (
        <EmptyState
          icon={Coins}
          title="Awaiting a comparison"
          description="Choose a workload above to see the estimated local versus AWS monthly cost reported by the backend."
        />
      ) : null}
    </div>
  );
}
