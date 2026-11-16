import { useState } from 'react';
import { AlertCircle, Cpu, Loader2, MemoryStick, Plus, Users, Wallet, AppWindow } from 'lucide-react';
import { createWorkload } from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

const FIELDS = [
  {
    name: 'applicationName',
    label: 'Application Name',
    type: 'text',
    placeholder: 'e.g. payments-orchestrator',
    icon: AppWindow,
    hint: '2–60 characters',
  },
  {
    name: 'cpuCores',
    label: 'CPU Cores',
    type: 'number',
    placeholder: '4',
    icon: Cpu,
    hint: 'Whole number, 1–256',
    min: 1,
    max: 256,
    step: 1,
  },
  {
    name: 'ramGb',
    label: 'RAM (GB)',
    type: 'number',
    placeholder: '8',
    icon: MemoryStick,
    hint: '0.5–4096 GB',
    min: 0.5,
    max: 4096,
    step: 0.5,
  },
  {
    name: 'expectedUsers',
    label: 'Expected Users',
    type: 'number',
    placeholder: '1000',
    icon: Users,
    hint: 'Whole number, 1–10,000,000',
    min: 1,
    step: 1,
  },
  {
    name: 'monthlyBudget',
    label: 'Monthly Budget (INR)',
    type: 'number',
    placeholder: '20000',
    icon: Wallet,
    hint: 'Budget per month in ₹',
    min: 1,
    step: 100,
  },
];

const EMPTY = {
  applicationName: '',
  cpuCores: '',
  ramGb: '',
  expectedUsers: '',
  monthlyBudget: '',
};

function validateField(name, value) {
  switch (name) {
    case 'applicationName': {
      const v = String(value).trim();
      if (!v) return 'Application name is required.';
      if (v.length < 2) return 'Use at least 2 characters.';
      if (v.length > 60) return 'Keep the name under 60 characters.';
      return '';
    }
    case 'cpuCores': {
      if (String(value).trim() === '') return 'CPU cores are required.';
      const n = Number(value);
      if (!Number.isFinite(n)) return 'Enter a valid number.';
      if (!Number.isInteger(n)) return 'CPU cores must be a whole number.';
      if (n < 1 || n > 256) return 'Enter a value between 1 and 256.';
      return '';
    }
    case 'ramGb': {
      if (String(value).trim() === '') return 'RAM is required.';
      const n = Number(value);
      if (!Number.isFinite(n)) return 'Enter a valid number.';
      if (n < 0.5 || n > 4096) return 'Enter a value between 0.5 and 4096 GB.';
      return '';
    }
    case 'expectedUsers': {
      if (String(value).trim() === '') return 'Expected users are required.';
      const n = Number(value);
      if (!Number.isFinite(n)) return 'Enter a valid number.';
      if (!Number.isInteger(n)) return 'Expected users must be a whole number.';
      if (n < 1 || n > 10000000) return 'Enter a value between 1 and 10,000,000.';
      return '';
    }
    case 'monthlyBudget': {
      if (String(value).trim() === '') return 'Monthly budget is required.';
      const n = Number(value);
      if (!Number.isFinite(n)) return 'Enter a valid number.';
      if (n <= 0) return 'Budget must be greater than 0.';
      if (n > 1000000000) return 'Enter a budget below ₹1,00,00,00,000.';
      return '';
    }
    default:
      return '';
  }
}

export default function WorkloadForm({ onSaved }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { notify } = useToast();

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name) => {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values[name]) }));
  };

  const validateAll = () => {
    const next = {};
    FIELDS.forEach(({ name }) => {
      const message = validateField(name, values[name]);
      if (message) next[name] = message;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validateAll()) {
      notify({ type: 'error', title: 'Check the form', message: 'Some fields need attention before this workload can be registered.' });
      return;
    }

    setSubmitting(true);
    try {
      await createWorkload({
        applicationName: values.applicationName.trim(),
        cpuCores: Number(values.cpuCores),
        ramGb: Number(values.ramGb),
        expectedUsers: Number(values.expectedUsers),
        monthlyBudget: Number(values.monthlyBudget),
      });
      notify({
        type: 'success',
        title: 'Workload registered',
        message: `${values.applicationName.trim()} is now available for placement analysis.`,
      });
      setValues(EMPTY);
      setErrors({});
      if (onSaved) await onSaved();
    } catch (err) {
      const message = err && err.message ? err.message : 'The workload could not be saved.';
      setFormError(message);
      notify({ type: 'error', title: 'Registration failed', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {FIELDS.map(({ name, label, type, placeholder, icon: Icon, hint, min, max, step }) => {
        const hasError = Boolean(errors[name]);
        return (
          <div key={name}>
            <label htmlFor={`field-${name}`} className="flex items-center justify-between gap-2 text-xs font-medium text-ink-200">
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
                {label}
              </span>
              <span className="text-[10px] font-normal text-ink-500">{hint}</span>
            </label>
            <div className="relative mt-2">
              <input
                id={`field-${name}`}
                name={name}
                type={type}
                inputMode={type === 'number' ? 'numeric' : undefined}
                value={values[name]}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                disabled={submitting}
                onChange={(event) => handleChange(name, event.target.value)}
                onBlur={() => handleBlur(name)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `error-${name}` : undefined}
                className={cn(
                  'w-full rounded-xl border bg-ink-950/60 px-3.5 py-2.5 text-sm text-ink-50 placeholder:text-ink-500 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
                  hasError
                    ? 'border-rose-glow/60 focus:border-rose-glow focus:ring-rose-glow/20'
                    : 'border-ink-700 focus:border-electric-500 focus:ring-electric-500/20',
                )}
              />
            </div>
            {hasError ? (
              <p id={`error-${name}`} className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-glow">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors[name]}
              </p>
            ) : null}
          </div>
        );
      })}

      {formError ? (
        <div className="rounded-xl border border-rose-glow/30 bg-rose-glow/10 px-4 py-3 text-xs leading-relaxed text-rose-glow">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl bg-electric-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-electric-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900',
          submitting && 'cursor-wait opacity-80',
        )}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {submitting ? 'Registering workload…' : 'Register Workload'}
      </button>
    </form>
  );
}
