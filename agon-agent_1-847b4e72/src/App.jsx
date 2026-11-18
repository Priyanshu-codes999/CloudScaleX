
import { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import { DataProvider } from './context/DataContext';
import { ToastProvider, useToast } from './context/ToastContext';

import Dashboard from './pages/Dashboard';
import Workloads from './pages/Workloads';
import Placement from './pages/Placement';
import CostOptimization from './pages/CostOptimization';
import Settings from './pages/Settings';

import {
  getAuthToken,
  getCurrentUser,
  loginUser,
  registerUser,
  logout,
} from './services/api';

const PAGE_TITLES = {
  '/': 'Overview',
  '/workloads': 'Workloads',
  '/placement': 'Placement Analysis',
  '/cost': 'Cost Optimization',
  '/settings': 'Settings',
};

/* -------------------------------------------------- */
/* Login and Signup Screen                            */
/* -------------------------------------------------- */

function AuthScreen({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { notify } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (isRegister && password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = isRegister
        ? await registerUser({ email, password })
        : await loginUser({ email, password });

      notify({
        type: 'success',
        title: isRegister ? 'Account created' : 'Welcome back',
        message: 'Authentication successful.',
      });

      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-electric-400/30 bg-electric-400/10 text-xl font-bold text-electric-300">
            C
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink-50">
            CloudScale X
          </h1>

          <p className="mt-2 text-sm text-ink-400">
            Intelligent hybrid cloud deployment platform
          </p>
        </div>

        <div className="rounded-2xl border border-ink-700 bg-ink-850 p-6 shadow-2xl sm:p-8">
          <h2 className="text-xl font-semibold text-ink-50">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>

          <p className="mt-2 text-sm text-ink-400">
            {isRegister
              ? 'Register to start managing your cloud workloads.'
              : 'Sign in to access your CloudScale X dashboard.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-2 block text-sm font-medium text-ink-200"
              >
                Email address
              </label>

              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-ink-50 outline-none transition focus:border-electric-400 focus:ring-2 focus:ring-electric-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-2 block text-sm font-medium text-ink-200"
              >
                Password
              </label>

              <input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={isRegister ? 8 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-ink-50 outline-none transition focus:border-electric-400 focus:ring-2 focus:ring-electric-400/20"
              />
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="mb-2 block text-sm font-medium text-ink-200"
                >
                  Confirm password
                </label>

                <input
                  id="auth-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-ink-50 outline-none transition focus:border-electric-400 focus:ring-2 focus:ring-electric-400/20"
                />
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-electric-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-electric-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Please wait...'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-400">
            {isRegister
              ? 'Already have an account? '
              : "Don't have an account? "}

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="font-semibold text-electric-300 hover:text-electric-200"
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          CloudScale X · Secure user authentication
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Authenticated Dashboard                            */
/* -------------------------------------------------- */

function Shell({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Overview';

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          pageTitle={pageTitle}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-500">
                Signed in as
              </p>
              <p className="truncate text-sm font-medium text-ink-200">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-ink-700 px-4 py-2 text-sm font-medium text-ink-200 transition hover:border-rose-400 hover:text-rose-300"
            >
              Sign out
            </button>
          </div>

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
          CloudScale X · Intelligent hybrid cloud deployment &amp; cost
          optimisation · Placement recommendations come from a transparent
          rule-based engine · Cost figures are illustrative estimates from
          the demonstration pricing model, not actual AWS quotations.
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Authentication Gate                                */
/* -------------------------------------------------- */

function AuthGate() {
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(getAuthToken() && getCurrentUser())
  );

  const [user, setUser] = useState(() => getCurrentUser());

  function handleAuthenticated(currentUser) {
    setUser(currentUser);
    setAuthenticated(true);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <AuthScreen onAuthenticated={handleAuthenticated} />
    );
  }

  return (
    <DataProvider>
      <Shell user={user} onLogout={handleLogout} />
    </DataProvider>
  );
}

/* -------------------------------------------------- */
/* Main Application                                   */
/* -------------------------------------------------- */

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthGate />
      </ToastProvider>
    </BrowserRouter>
  );
}
