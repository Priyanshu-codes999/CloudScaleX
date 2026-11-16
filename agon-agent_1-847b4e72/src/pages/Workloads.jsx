
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Coins,
  Database,
  Loader2,
  Search,
  Target,
  Pencil,
  Trash2,
  X,
  Save,
  Plus,
} from 'lucide-react';

import { useData } from '../context/DataContext';
import WorkloadForm from '../components/WorkloadForm';
import WorkloadTable from '../components/WorkloadTable';
import Modal from '../components/Modal';

import {
  fetchWorkload,
  updateWorkload,
  deleteWorkload,
  formatINR,
  formatNumber,
} from '../services/api';

const EMPTY_FORM = {
  applicationName: '',
  cpuCores: '',
  ramGb: '',
  expectedUsers: '',
  monthlyBudget: '',
};

export default function Workloads() {
  const {
    workloads,
    workloadsLoading,
    workloadsError,
    refreshWorkloads,
  } = useData();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return workloads;

    return workloads.filter(
      (w) =>
        w.applicationName.toLowerCase().includes(needle) ||
        (w.id !== null && String(w.id).includes(needle))
    );
  }, [workloads, query]);

  const loadDetail = useCallback(async (workload) => {
    if (!workload || workload.id === null) {
      setDetail(workload);
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    try {
      const fresh = await fetchWorkload(workload.id);
      setDetail(fresh);
    } catch (err) {
      setDetailError(err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openDetails = (workload) => {
    setSelected(workload);
    setActionError('');
    setSuccessMessage('');
    loadDetail(workload);
  };

  const closeDetails = () => {
    setSelected(null);
    setDetail(null);
    setDetailError(null);
    setActionError('');
  };

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      setDetailError(null);
    }
  }, [selected]);

  const shown = detail || selected;

  // Open edit form with existing workload information
  const openEdit = (workload) => {
    setEditing(workload);

    setEditForm({
      applicationName: workload.applicationName || '',
      cpuCores: workload.cpuCores ?? '',
      ramGb: workload.ramGb ?? '',
      expectedUsers: workload.expectedUsers ?? '',
      monthlyBudget: workload.monthlyBudget ?? '',
    });

    setActionError('');
    setSuccessMessage('');
  };

  const closeEdit = () => {
    if (saving) return;

    setEditing(null);
    setEditForm(EMPTY_FORM);
    setActionError('');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update workload through Spring Boot PUT endpoint
  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editing) return;

    const cpu = Number(editForm.cpuCores);
    const ram = Number(editForm.ramGb);
    const users = Number(editForm.expectedUsers);
    const budget = Number(editForm.monthlyBudget);

    if (!editForm.applicationName.trim()) {
      setActionError('Application name is required.');
      return;
    }

    if (!Number.isInteger(cpu) || cpu < 1) {
      setActionError('CPU cores must be at least 1.');
      return;
    }

    if (!Number.isInteger(ram) || ram < 1) {
      setActionError('RAM must be at least 1 GB.');
      return;
    }

    if (!Number.isInteger(users) || users < 0) {
      setActionError('Expected users cannot be negative.');
      return;
    }

    if (!Number.isFinite(budget) || budget < 0) {
      setActionError('Monthly budget cannot be negative.');
      return;
    }

    setSaving(true);
    setActionError('');

    try {
      await updateWorkload(editing.id, {
        applicationName: editForm.applicationName.trim(),
        cpuCores: cpu,
        ramGb: ram,
        expectedUsers: users,
        monthlyBudget: budget,
      });

      await refreshWorkloads();

      setEditing(null);
      setEditForm(EMPTY_FORM);
      setSuccessMessage('Workload updated successfully.');

      const updated = await fetchWorkload(editing.id);
      setSelected(updated);
      setDetail(updated);
    } catch (err) {
      setActionError(err.message || 'Unable to update workload.');
    } finally {
      setSaving(false);
    }
  };

  // Delete workload through Spring Boot DELETE endpoint
  const handleDelete = async (workload) => {
    if (!workload || workload.id === null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${workload.applicationName}" (ID: ${workload.id})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(workload.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await deleteWorkload(workload.id);

      await refreshWorkloads();

      if (selected?.id === workload.id) {
        closeDetails();
      }

      if (editing?.id === workload.id) {
        closeEdit();
      }

      setSuccessMessage(
        `Workload "${workload.applicationName}" deleted successfully.`
      );
    } catch (err) {
      setActionError(err.message || 'Unable to delete workload.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-50 sm:text-2xl">
            Workload Management
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-300">
            Register, inspect, update and delete application workloads using
            the CloudScale X backend.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-400">
          <Database className="h-4 w-4" />
          <span>
            {workloadsLoading
              ? 'Loading…'
              : `${workloads.length} workload${workloads.length === 1 ? '' : 's'} stored`}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {actionError && !editing && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {actionError}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">

        {/* Create Workload */}
        <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80 p-6">
          <h2 className="text-sm font-semibold tracking-tight text-ink-50">
            Register a workload
          </h2>

          <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
            Create and persist a new workload in PostgreSQL.
          </p>

          <div className="mt-5">
            <WorkloadForm onSaved={refreshWorkloads} />
          </div>
        </section>

        {/* Workload Table */}
        <section className="rounded-2xl border border-ink-700/70 bg-ink-900/80">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-ink-50">
                Registered workloads
              </h2>

              <p className="mt-1 text-[11px] text-ink-400">
                Live data from GET /api/v1/workloads
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name or id…"
                aria-label="Filter workloads"
                className="w-full rounded-lg border border-ink-700 bg-ink-950/60 py-2 pl-9 pr-3 text-xs text-ink-100 placeholder:text-ink-500 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20"
              />
            </div>
          </div>

          <WorkloadTable
            workloads={filtered}
            loading={workloadsLoading}
            error={workloadsError}
            onRetry={refreshWorkloads}
            onSelect={openDetails}
          />
        </section>
      </div>

      {/* Workload Details Modal */}
      <Modal
        open={Boolean(selected)}
        title={shown ? shown.applicationName : ''}
        subtitle={
          shown
            ? shown.id === null
              ? 'ID unavailable'
              : `Workload #${shown.id}`
            : ''
        }
        onClose={closeDetails}
        footer={
          selected ? (
            <div className="flex flex-wrap items-center gap-2.5">

              <button
                type="button"
                onClick={() => openEdit(shown || selected)}
                disabled={detailLoading || !shown}
                className="inline-flex items-center gap-2 rounded-xl border border-electric-500/40 bg-electric-500/10 px-4 py-2.5 text-xs font-semibold text-electric-300 transition-colors hover:bg-electric-500/20 disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selected)}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
              >
                {deletingId === selected.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = selected.id;
                  closeDetails();
                  navigate(`/placement?id=${id}`);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-electric-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-electric-400"
              >
                <Target className="h-3.5 w-3.5" />
                Analyze placement
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = selected.id;
                  closeDetails();
                  navigate(`/cost?id=${id}`);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-850 px-4 py-2.5 text-xs font-semibold text-ink-100 transition-colors hover:border-electric-500/60"
              >
                <Coins className="h-3.5 w-3.5" />
                Compare costs
              </button>

              <button
                type="button"
                onClick={closeDetails}
                className="ml-auto rounded-xl px-4 py-2.5 text-xs font-medium text-ink-300 hover:text-ink-100"
              >
                Close
              </button>
            </div>
          ) : null
        }
      >
        {detailLoading ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-electric-400" />
            <p className="text-xs text-ink-300">
              Fetching workload from backend…
            </p>
          </div>
        ) : detailError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-400" />

              <div>
                <p className="text-xs font-semibold text-ink-50">
                  Workload detail could not be loaded
                </p>

                <p className="mt-1 text-xs text-ink-300">
                  {detailError.message}
                </p>

                <button
                  type="button"
                  onClick={() => loadDetail(selected)}
                  className="mt-3 rounded-full border border-ink-600 px-3.5 py-1.5 text-[11px] text-ink-100"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : shown ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'CPU Cores',
                value: shown.cpuCores === null ? '—' : shown.cpuCores,
              },
              {
                label: 'RAM',
                value: shown.ramGb === null ? '—' : `${shown.ramGb} GB`,
              },
              {
                label: 'Expected Users',
                value: formatNumber(shown.expectedUsers),
              },
              {
                label: 'Monthly Budget',
                value: formatINR(shown.monthlyBudget),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-ink-800 bg-ink-950/50 px-4 py-4"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">
                  {item.label}
                </p>

                <p className="mt-1.5 text-lg font-semibold tabular-nums text-ink-50">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

      {/* Edit Workload Modal */}
      <Modal
        open={Boolean(editing)}
        title="Edit workload"
        subtitle={
          editing ? `Update workload #${editing.id}` : ''
        }
        onClose={closeEdit}
        footer={null}
      >
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-4">

            <div>
              <label className="mb-1.5 block text-xs text-ink-300">
                Application Name
              </label>

              <input
                name="applicationName"
                value={editForm.applicationName}
                onChange={handleEditChange}
                required
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-electric-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-ink-300">
                  CPU Cores
                </label>

                <input
                  name="cpuCores"
                  type="number"
                  min="1"
                  step="1"
                  value={editForm.cpuCores}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-ink-300">
                  RAM (GB)
                </label>

                <input
                  name="ramGb"
                  type="number"
                  min="1"
                  step="1"
                  value={editForm.ramGb}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-ink-300">
                  Expected Users
                </label>

                <input
                  name="expectedUsers"
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.expectedUsers}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-ink-300">
                  Monthly Budget (₹)
                </label>

                <input
                  name="monthlyBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.monthlyBudget}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-electric-500 focus:outline-none"
                />
              </div>
            </div>

            {actionError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300"
              >
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-ink-800 pt-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-700 px-4 py-2.5 text-xs font-medium text-ink-200 hover:bg-ink-800 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-electric-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-electric-400 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}

                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Footer */}
      <div className="rounded-2xl border border-ink-800 bg-ink-900/50 px-5 py-4 text-[11px] leading-relaxed text-ink-400">
        Need a place to start?{' '}
        <Link
          to="/placement"
          className="font-medium text-electric-300 hover:text-electric-200"
        >
          Analyse an existing workload
        </Link>{' '}
        or{' '}
        <Link
          to="/cost"
          className="font-medium text-electric-300 hover:text-electric-200"
        >
          compare local vs AWS costs
        </Link>
        . All records come from the backend.
      </div>
    </div>
  );
}
