import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Cloud,
  Cpu,
  Database,
  Gauge,
  Server,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { fetchPlacement, formatINR, formatNumber, normalizePlacement } from '../services/api';
import { formatDateTime, truncate } from '../lib/utils';

const PIE_COLORS = { LOCAL: '#4D9BFF', AWS: '#2FD8F0' };
const PLACEMENT_SAMPLE_LIMIT = 25;

function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-ink-700/70 bg-ink-900/80 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-ink-50">{title}</h2>
          {subtitle ? <p className="mt-1 text-[11px] text-ink-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const { workloads, workloadsLoading, workloadsError, refreshWorkloads, connection, apiBaseUrl, lastUpdated } =
    useData();
  const [placementState, setPlacementState] = useState({ map: {}, loading: false, resolved: 0, failed: 0 });

  useEffect(() => {
    let cancelled = false;
    if (!workloads.length) {
      setPlacementState({ map: {}, loading: false, resolved: 0, failed: 0 });
      return undefined;
    }
    setPlacementState((prev) => ({ ...prev, loading: true }));
    const targets = [...workloads]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, PLACEMENT_SAMPLE_LIMIT);

    (async () => {
      const results = await Promise.allSettled(targets.map((w) => fetchPlacement(w.id)));
      if (cancelled) return;
      const map = {};
      let resolved = 0;
      let failed = 0;
      results.forEach((result, index) => {
        const id = targets[index].id;
        if (result.status === 'fulfilled') {
          const normalized = normalizePlacement(result.value ? result.value.raw : null) || result.value;
          if (normalized && normalized.platform) {
            map[id] = normalized;
            resolved += 1;
          } else {
            failed += 1;
          }
        } else {
          failed += 1;
        }
      });
      setPlacementState({ map, loading: false, resolved, failed });
    })();

    return () => {
      cancelled = true;
    };
  }, [workloads]);

  const stats = useMemo(() => {
    let local = 0;
    let aws = 0;
    Object.values(placementState.map).forEach((entry) => {
      if (entry.platform === 'LOCAL') local += 1;
      if (entry.platform === 'AWS') aws += 1;
    });
    const totalBudget = workloads.reduce(
      (sum, w) => sum + (w.monthlyBudget === null ? 0 : w.monthlyBudget),
      0,
    );
    const totalCpu = workloads.reduce((sum, w) => sum + (w.cpuCores === null ? 0 : w.cpuCores), 0);
    const totalRam = workloads.reduce((sum, w) => sum + (w.ramGb === null ? 0 : w.ramGb), 0);
    const totalUsers = workloads.reduce((sum, w) => sum + (w.expectedUsers === null ? 0 : w.expectedUsers), 0);
    return { local, aws, totalBudget, totalCpu, totalRam, totalUsers };
  }, [placementState.map, workloads]);

  const resourceData = useMemo(
    () =>
      [...workloads]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, 12)
        .map((w) => ({
          name: truncate(w.applicationName, 14),
          cpu: w.cpuCores,
          ram: w.ramGb,
        }))
        .filter((row) => row.cpu !== null || row.ram !== null),
    [workloads],
  );

  const pieData = [
    { name: 'Local Infrastructure', value: stats.local, key: 'LOCAL' },
    { name: 'AWS Cloud', value: stats.aws, key: 'AWS' },
  ].filter((slice) => slice.value > 0);

  const recentWorkloads = useMemo(
    () => [...workloads].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 5),
    [workloads],
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      {/* Control plane header */}
      <section className="relative overflow-hidden rounded-2xl border border-ink-700/70">
        <img
          src="/images/control-plane.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/92 to-ink-950/55" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-electric-300">
            Hybrid cloud control plane
          </p>
          <h1 className="mt-2.5 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink-50 sm:text-[30px]">
            Placement and cost decisions for every registered workload.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">
            Every figure on this page is read from the CloudScale X backend in real time. Nothing is simulated,
            preloaded or estimated client-side — if the backend is quiet, the dashboard shows 0 and empty states.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-[11px]">
            <span className="rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1.5 text-ink-200">
              Backend: <span className="font-medium text-ink-50">{apiBaseUrl}</span>
            </span>
            <span className="rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1.5 text-ink-200">
              Status:{' '}
              <span
                className={
                  connection.status === 'online'
                    ? 'font-medium text-emerald-glow'
                    : connection.status === 'offline'
                      ? 'font-medium text-rose-glow'
                      : 'font-medium text-amber-glow'
                }
              >
                {connection.status === 'online'
                  ? 'Connected'
                  : connection.status === 'offline'
                    ? 'Unavailable'
                    : 'Checking'}
              </span>
            </span>
            <span className="rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1.5 text-ink-200">
              Last sync: <span className="font-medium text-ink-50">{formatDateTime(lastUpdated)}</span>
            </span>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Database}
          label="Total Workloads"
          value={formatNumber(workloads.length)}
          hint="Returned by GET /api/v1/workloads"
          tone="blue"
          loading={workloadsLoading}
        />
        <StatCard
          icon={Server}
          label="Local Placement"
          value={formatNumber(stats.local)}
          hint={
            placementState.loading
              ? 'Querying placement engine…'
              : `Recommended for on-premise (${placementState.resolved} analysed)`
          }
          tone="green"
          loading={workloadsLoading || placementState.loading}
        />
        <StatCard
          icon={Cloud}
          label="AWS Placement"
          value={formatNumber(stats.aws)}
          hint={
            placementState.loading
              ? 'Querying placement engine…'
              : `Recommended for AWS (${placementState.resolved} analysed)`
          }
          tone="cyan"
          loading={workloadsLoading || placementState.loading}
        />
        <StatCard
          icon={Gauge}
          label="Combined Monthly Budget"
          value={formatINR(stats.totalBudget)}
          hint="Sum of declared workload budgets (INR)"
          tone="violet"
          loading={workloadsLoading}
        />
      </div>

      {workloadsError ? (
        <ErrorState
          title="Workload data is unavailable"
          description={workloadsError.message}
          onRetry={refreshWorkloads}
          retryLabel="Reload workloads"
        />
      ) : null}

      {/* Resource overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          title="Workload resource overview"
          subtitle="CPU and RAM declared per workload (most recent 12)"
          className="xl:col-span-2"
        >
          {workloadsLoading ? (
            <LoadingState label="Loading workload resources…" />
          ) : resourceData.length === 0 ? (
            <EmptyState
              icon={Cpu}
              title="No resource data to chart"
              description="Register workloads to see their declared CPU and RAM footprint. Charts are only rendered from real backend records."
              action={
                <Link
                  to="/workloads"
                  className="inline-flex items-center gap-1.5 rounded-full border border-electric-500/50 bg-electric-500/10 px-4 py-2 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/20"
                >
                  Register a workload <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Total vCPU</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink-50">{formatNumber(stats.totalCpu)}</p>
                </div>
                <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Total RAM (GB)</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink-50">{formatNumber(stats.totalRam)}</p>
                </div>
                <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Expected Users</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink-50">{formatNumber(stats.totalUsers)}</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceData} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172B44" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#7391B5', fontSize: 10 }}
                      axisLine={{ stroke: '#1E3451' }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis tick={{ fill: '#7391B5', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(46,125,246,0.08)' }}
                      contentStyle={{
                        background: '#0E1A2C',
                        border: '1px solid #1E3451',
                        borderRadius: 12,
                        color: '#E3ECF7',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#9AB2CC' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#9AB2CC' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar dataKey="cpu" name="CPU cores" fill="#4D9BFF" radius={[6, 6, 0, 0]} maxBarSize={18} />
                    <Bar dataKey="ram" name="RAM (GB)" fill="#2FD8F0" radius={[6, 6, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        <Card
          title="Placement distribution"
          subtitle="Live output of the rule-based placement engine"
          action={
            <Link
              to="/placement"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-electric-300 transition-colors hover:text-electric-200"
            >
              Open analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {workloadsLoading || placementState.loading ? (
            <LoadingState label="Running placement checks…" />
          ) : pieData.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No placement results yet"
              description={
                workloads.length
                  ? 'The placement engine has not returned any recommendations for the current workloads.'
                  : 'Register a workload first — placement counts only come from the live engine.'
              }
            />
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={3}
                      stroke="#0B1424"
                      strokeWidth={2}
                    >
                      {pieData.map((slice) => (
                        <Cell key={slice.key} fill={PIE_COLORS[slice.key] || '#47648C'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0E1A2C',
                        border: '1px solid #1E3451',
                        borderRadius: 12,
                        color: '#E3ECF7',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#9AB2CC' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2.5">
                {pieData.map((slice) => (
                  <li key={slice.key} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-ink-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[slice.key] || '#47648C' }}
                      />
                      {slice.name}
                    </span>
                    <span className="font-semibold tabular-nums text-ink-100">{slice.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-ink-800 pt-3 text-[11px] leading-relaxed text-ink-500">
                {placementState.failed > 0
                  ? `Placement data unavailable for ${placementState.failed} workload(s); only successful engine responses are counted.`
                  : `Counted from ${placementState.resolved} live engine response(s).`}
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Recent workloads */}
      <Card
        title="Recent workloads"
        subtitle="Latest registrations returned by the backend"
        action={
          <Link
            to="/workloads"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-3.5 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-electric-500/60 hover:text-ink-50"
          >
            Manage workloads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {workloadsLoading ? (
          <LoadingState label="Loading recent workloads…" />
        ) : recentWorkloads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nothing here yet"
            description="Once workloads are registered through POST /api/v1/workloads they appear here instantly."
          />
        ) : (
          <ul className="divide-y divide-ink-800/80">
            {recentWorkloads.map((workload, index) => (
              <li key={workload.id ?? index} className="flex flex-wrap items-center gap-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-700 bg-ink-850 text-[11px] font-semibold text-electric-300">
                  {workload.applicationName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-50">{workload.applicationName}</p>
                  <p className="text-[11px] text-ink-500">
                    {workload.cpuCores === null ? '—' : `${workload.cpuCores} cores`} ·{' '}
                    {workload.ramGb === null ? '—' : `${workload.ramGb} GB`} ·{' '}
                    {formatNumber(workload.expectedUsers)} users
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums text-ink-100">
                  {formatINR(workload.monthlyBudget)}
                  <span className="ml-1 text-[11px] font-normal text-ink-500">/mo</span>
                </p>
                <Link
                  to={`/placement?id=${workload.id}`}
                  className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-electric-500/60 hover:text-ink-50"
                >
                  Analyze
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
