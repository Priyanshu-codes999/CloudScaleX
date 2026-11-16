import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Loader2, Server, Target } from 'lucide-react';
import { useData } from '../context/DataContext';
import PlacementCard from '../components/PlacementCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { fetchPlacement } from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export default function Placement() {
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

  const analyze = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const placement = await fetchPlacement(id);
      if (!placement || !placement.platform) {
        setError({ message: 'The placement engine returned no recommendation for this workload.' });
      } else {
        setResult(placement);
      }
    } catch (err) {
      setError(err);
      notify({ type: 'error', title: 'Placement analysis failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Pre-select (and run once) when navigated with ?id=<workload id>
  useEffect(() => {
    if (!queryId || autoRan.current || workloadsLoading) return;
    const match = workloads.find((w) => String(w.id) === String(queryId));
    if (match) {
      autoRan.current = true;
      setSelectedId(String(match.id));
      analyze(match.id);
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
        <h1 className="text-xl font-semibold tracking-tight text-ink-50 sm:text-2xl">Placement Analysis</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-300">
          Select a registered workload and run the CloudScale X rule-based placement engine. The recommendation
          below is the engine's own output — this platform does not claim machine-learning predictions.
        </p>
      </div>

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
        <label htmlFor="placement-workload" className="text-xs font-medium text-ink-200">
          Workload to analyse
        </label>
        <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Server className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <select
              id="placement-workload"
              value={selectedId}
              onChange={(event) => handleSelect(event.target.value)}
              disabled={workloadsLoading || loading}
              className={cn(
                'w-full appearance-none rounded-xl border border-ink-700 bg-ink-950/60 py-3 pl-10 pr-10 text-sm text-ink-100 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20 disabled:opacity-60',
              )}
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
            onClick={() => analyze(selectedId)}
            disabled={!selectedId || loading}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl bg-electric-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-electric-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-300',
              (!selectedId || loading) && 'cursor-not-allowed opacity-60',
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            {loading ? 'Analysing…' : 'Run placement analysis'}
          </button>
        </div>
        <p className="mt-2.5 text-[11px] text-ink-500">
          Endpoint: <span className="font-mono text-ink-400">GET /api/v1/placement/{'{id}'}</span> · results are
          cached only for the current session and never fabricated.
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
          title="No workloads available for analysis"
          description="Placement analysis needs at least one registered workload. Nothing is preloaded — register one and it will appear here."
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

      {loading ? <LoadingState label="The rule-based placement engine is evaluating this workload…" /> : null}

      {error && !loading ? (
        <ErrorState
          title="Placement analysis failed"
          description={error.message}
          onRetry={() => analyze(selectedId)}
          retryLabel="Run analysis again"
        />
      ) : null}

      {result && !loading ? <PlacementCard placement={result} workload={selectedWorkload} /> : null}

      {!loading && !error && !result && workloads.length > 0 ? (
        <EmptyState
          icon={Target}
          title="Awaiting an analysis"
          description="Choose a workload above and run the analysis to see the engine's platform recommendation and reasoning."
        />
      ) : null}
    </div>
  );
}
