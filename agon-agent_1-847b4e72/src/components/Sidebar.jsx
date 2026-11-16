import { NavLink } from 'react-router-dom';
import { Coins, LayoutDashboard, Server, Settings, ShieldCheck, Target, X } from 'lucide-react';
import Logo from './Logo';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/workloads', label: 'Workloads', icon: Server },
  { to: '/placement', label: 'Placement Analysis', icon: Target },
  { to: '/cost', label: 'Cost Optimization', icon: Coins },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400',
              isActive
                ? 'bg-electric-500/12 text-ink-50'
                : 'text-ink-300 hover:bg-ink-800/70 hover:text-ink-100',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-electric-400 transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ open, onClose }) {
  const { apiBaseUrl } = useData();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col border-r border-ink-800 bg-ink-900 transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <p className="text-[15px] font-semibold leading-tight tracking-tight text-ink-50">
                CloudScale <span className="text-electric-400">X</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Hybrid Cloud Ops</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="px-4">
          <div className="rounded-xl border border-ink-800 bg-ink-850/70 px-3.5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">Workspace</p>
            <p className="mt-1 truncate text-xs text-ink-200" title={apiBaseUrl}>
              {apiBaseUrl}
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto px-4">
          <p className="px-3.5 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
            Platform
          </p>
          <NavList onNavigate={onClose} />
        </div>

        <div className="m-4 rounded-2xl border border-ink-800 bg-gradient-to-b from-ink-850 to-ink-900 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-glow" strokeWidth={1.8} />
            <p className="text-xs font-semibold text-ink-100">Transparent by design</p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
            Placement comes from the rule-based engine. Cost figures are illustrative estimates from the
            demonstration pricing model — never AWS quotations.
          </p>
        </div>
      </aside>
    </>
  );
}
