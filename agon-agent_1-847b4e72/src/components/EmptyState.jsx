import { cn } from '../lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700/70 bg-ink-900/40 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-700 bg-ink-850 text-ink-300">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-ink-100">{title}</p>
        {description ? (
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-ink-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
