import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import Workloads from './pages/Workloads';
import Placement from './pages/Placement';
import CostOptimization from './pages/CostOptimization';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  '/': 'Overview',
  '/workloads': 'Workloads',
  '/placement': 'Placement Analysis',
  '/cost': 'Cost Optimization',
  '/settings': 'Settings',
};

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Overview';

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar pageTitle={pageTitle} onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workloads" element={<Workloads />} />
            <Route path="/placement" element={<Placement />} />
            <Route path="/cost" element={<CostOptimization />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-ink-800 px-4 py-5 text-[11px] leading-relaxed text-ink-500 sm:px-6 lg:px-10">
          CloudScale X · Intelligent hybrid cloud deployment &amp; cost optimisation · Placement recommendations
          come from a transparent rule-based engine · Cost figures are illustrative estimates from the
          demonstration pricing model, not actual AWS quotations.
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
