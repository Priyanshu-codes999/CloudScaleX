import { useState } from 'react';
import { CheckCircle2, Code2, Link2, RefreshCw, RotateCcw, Server, ShieldCheck, XCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { API_ENDPOINTS, WORKLOAD_REQUEST_EXAMPLE, getEnvironmentBaseUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn, formatDateTime } from '../lib/utils';

export default function Settings() {
  const { apiBaseUrl, updateApiBaseUrl, connection, checkBackend, refreshAll, refreshing } = useData();
  const { notify } = useToast();
  const [draft, setDraft] = useState(apiBaseUrl);
  const [testing, setTesting] = useState(false);

  const dirty = draft.trim().replace(/\/+$/, '') !== apiBaseUrl;

  const handleSave = async (event) => {
    event.preventDefault();
    const value = draft.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(value)) {
      notify({
        type: 'error',
        title: 'Invalid backend URL',
        message: 'The base URL must start with http:// or https://.',
      });
      return;
    }
    updateApiBaseUrl(value);
    notify({ type: 'success', title: 'Backend URL updated', message: `Active base URL is now ${value}.` });
    await refreshAll();
  };

  const handleReset = async () => {
    updateApiBaseUrl(getEnvironmentBaseUrl());
    setDraft(getEnvironmentBaseUrl());
    notify({
      type: 'info',
      title: 'Reset to environment default',
      message: `Using VITE_API_BASE_URL = ${getEnvironmentBaseUrl()}`,
    });
    await refreshAll();
  };

  const handleTest = async () => {
    setTesting(true);
    const result = await checkBackend();
    setTesting(false);
    notify({
      type: result.ok ? 'success' : 'error',
      title: result.ok ? 'Backend reachable' : 'Backend unreachable',
      message: result.ok ? `Responded in ${result.latencyMs} ms.` : result.message,
    });
  };

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-50 sm:text-2xl">Settings</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-300">
          Configure the Spring Boot backend this console talks to, verify connectivity and review the exact API
          contract CloudScale X uses.
        </p>
      </div>

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-300 ring-1 ring-inset ring-electric-500/25">
            <Link2 className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink-50">Backend connection</h2>
            <p className="mt-0.5 text-[11px] text-ink-400">
              Defaults to the VITE_API_BASE_URL environment variable.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="api-base-url" className="text-xs font-medium text-ink-200">
              Backend base URL
            </label>
            <input
              id="api-base-url"
              type="url"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="http://localhost:8080"
              className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-950/60 px-3.5 py-2.5 font-mono text-sm text-ink-100 placeholder:text-ink-500 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={!dirty}
            className={cn(
              'rounded-xl bg-electric-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-300',
              !dirty && 'cursor-not-allowed opacity-50',
            )}
          >
            Save & reconnect
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-850 px-5 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:border-electric-500/60 hover:text-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </form>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">Environment default</p>
            <p className="mt-1.5 break-all font-mono text-xs text-ink-200">{getEnvironmentBaseUrl()}</p>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">Active base URL</p>
            <p className="mt-1.5 break-all font-mono text-xs text-electric-300">{apiBaseUrl}</p>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">Last health check</p>
            <p className="mt-1.5 text-xs text-ink-200">{formatDateTime(connection.checkedAt)}</p>
          </div>
        </div>

        <div
          className={cn(
            'mt-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5',
            connection.status === 'online'
              ? 'border-emerald-glow/25 bg-emerald-glow/[0.07]'
              : connection.status === 'offline'
                ? 'border-rose-glow/25 bg-rose-glow/[0.07]'
                : 'border-amber-glow/25 bg-amber-glow/[0.07]',
          )}
        >
          {connection.status === 'online' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-glow" strokeWidth={1.8} />
          ) : connection.status === 'offline' ? (
            <XCircle className="h-4.5 w-4.5 text-rose-glow" strokeWidth={1.8} />
          ) : (
            <RefreshCw className="h-4.5 w-4.5 animate-spin text-amber-glow" strokeWidth={1.8} />
          )}
          <p className="flex-1 text-xs leading-relaxed text-ink-200">{connection.message}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-4 py-2 text-xs font-medium text-ink-100 transition-colors hover:border-electric-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 disabled:opacity-60"
            >
              <Server className="h-3.5 w-3.5" />
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-4 py-2 text-xs font-medium text-ink-100 transition-colors hover:border-electric-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 disabled:opacity-60"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh data
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-glow/10 text-cyan-glow ring-1 ring-inset ring-cyan-glow/25">
            <Code2 className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink-50">API contract</h2>
            <p className="mt-0.5 text-[11px] text-ink-400">
              The exact endpoints this frontend consumes — no others are used.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {API_ENDPOINTS.map((endpoint) => (
            <li
              key={`${endpoint.method}-${endpoint.path}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3"
            >
              <span
                className={cn(
                  'rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider',
                  endpoint.method === 'GET'
                    ? 'bg-electric-500/12 text-electric-300'
                    : 'bg-emerald-glow/12 text-emerald-glow',
                )}
              >
                {endpoint.method}
              </span>
              <code className="font-mono text-xs text-ink-100">{endpoint.path}</code>
              <span className="ml-auto text-[11px] text-ink-400">{endpoint.summary}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">
            POST /api/v1/workloads request schema
          </p>
          <pre className="mt-2.5 overflow-x-auto rounded-xl border border-ink-800 bg-ink-950 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
            {JSON.stringify(WORKLOAD_REQUEST_EXAMPLE, null, 2)}
          </pre>
          <p className="mt-2 text-[11px] text-ink-500">
            Shown for documentation only — this example is never preloaded as a record.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-glow/10 text-emerald-glow ring-1 ring-inset ring-emerald-glow/25">
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink-50">Data integrity policy</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
              CloudScale X never fabricates workloads, statistics, AWS prices or chart values. Every number on
              every screen is either returned by the backend or derived from its responses. When an endpoint is
              unreachable the interface reports the failure instead of substituting sample data.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-ink-400">
              <li>· Placement output is produced by a transparent rule-based engine — not machine learning.</li>
              <li>· Cost figures are illustrative estimates from the demonstration pricing model.</li>
              <li>· Charts render only when real values are available; otherwise an empty state is shown.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
