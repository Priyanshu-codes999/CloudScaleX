import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Cloud, Info, Server, TrendingDown, Wallet } from 'lucide-react';
import { formatINR } from '../services/api';
import { cn } from '../lib/utils';

const CHART_COLORS = ['#4D9BFF', '#2FD8F0'];

function MetricPanel({ icon: Icon, label, value, sub, tone = 'blue' }) {
  const tones = {
    blue: 'text-electric-300 bg-electric-500/10 ring-electric-500/25',
    cyan: 'text-cyan-glow bg-cyan-glow/10 ring-cyan-glow/25',
    green: 'text-emerald-glow bg-emerald-glow/10 ring-emerald-glow/25',
  };
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
      <div className="flex items-center gap-2.5">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset', tones[tone])}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">{label}</p>
      </div>
      <p className="mt-4 text-[22px] font-semibold tabular-nums tracking-tight text-ink-50">{value}</p>
      {sub ? <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">{sub}</p> : null}
    </div>
  );
}

export default function CostComparison({ cost, workload }) {
  const hasChart = cost.localMonthlyCost !== null && cost.awsMonthlyCost !== null;
  const chartData = [
    { name: 'Local Infrastructure', cost: cost.localMonthlyCost ?? 0 },
    { name: 'AWS Cloud', cost: cost.awsMonthlyCost ?? 0 },
  ];
  const recommended = cost.recommendedOption;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-6 py-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">Cost comparison</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-ink-50">
            {workload ? workload.applicationName : 'Workload'} — monthly infrastructure estimate
          </h3>
        </div>
        {recommended ? (
          <span
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset',
              recommended === 'LOCAL'
                ? 'bg-electric-500/12 text-electric-300 ring-electric-500/30'
                : recommended === 'AWS'
                  ? 'bg-cyan-glow/12 text-cyan-glow ring-cyan-glow/30'
                  : 'bg-ink-800 text-ink-200 ring-ink-600',
            )}
          >
            Recommended: {recommended === 'LOCAL' ? 'Local' : recommended === 'AWS' ? 'AWS' : recommended}
          </span>
        ) : null}
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricPanel
            icon={Server}
            label="Estimated Local Monthly Cost"
            value={formatINR(cost.localMonthlyCost)}
            sub="On-premise infrastructure estimate"
            tone="blue"
          />
          <MetricPanel
            icon={Cloud}
            label="Estimated AWS Monthly Cost"
            value={formatINR(cost.awsMonthlyCost)}
            sub="AWS cloud estimate"
            tone="cyan"
          />
          <MetricPanel
            icon={TrendingDown}
            label="Estimated Savings"
            value={formatINR(cost.estimatedSavings)}
            sub="Difference reported by the cost engine"
            tone="green"
          />
        </div>

        {hasChart ? (
          <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">
              Reported monthly cost (₹)
            </p>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#172B44" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#7391B5', fontSize: 11 }}
                    axisLine={{ stroke: '#1E3451' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#7391B5', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  />
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
                    formatter={(value) => [formatINR(value), 'Estimated monthly cost']}
                  />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]} maxBarSize={72}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-ink-700 px-5 py-6 text-center text-xs text-ink-400">
            The cost engine did not return both cost figures, so no chart is rendered. Values are never guessed.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-950/40 px-5 py-5">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-4.5 w-4.5 shrink-0 text-electric-300" strokeWidth={1.8} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-300">Explanation</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-100">
                {cost.explanation || 'The cost engine did not return an explanation for this comparison.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-glow/25 bg-amber-glow/[0.07] px-5 py-4">
          <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-glow" strokeWidth={1.8} />
          <p className="text-xs leading-relaxed text-amber-200/90">
            These figures are <strong className="font-semibold">illustrative estimates</strong> produced by the
            current demonstration pricing model in the CloudScale X backend. They are not actual AWS quotations,
            binding prices or live rates, and should not be used for procurement decisions.
          </p>
        </div>

        <details className="group mt-4 rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-ink-300 transition-colors hover:text-ink-100">
            View raw cost engine response
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-ink-950 p-4 text-[11px] leading-relaxed text-ink-300">
            {JSON.stringify(cost.raw, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
