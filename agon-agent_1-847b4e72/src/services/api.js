
/**
 * CloudScale X — backend API service.
 *
 * All requests connect to the Spring Boot backend.
 * In production, requests use the same origin and are
 * forwarded by Nginx to the Kubernetes backend Service.
 * No mock data, fallback fixtures or invented pricing.
 */

const ENV_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ''
).trim();

const STORAGE_KEY = 'cloudscalex.apiBaseUrl';
const REQUEST_TIMEOUT_MS = 10000;
const HEALTH_TIMEOUT_MS = 6000;

export const API_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/workloads', summary: 'List all workloads.' },
  { method: 'POST', path: '/api/v1/workloads', summary: 'Create a workload.' },
  { method: 'GET', path: '/api/v1/workloads/{id}', summary: 'Get workload by ID.' },
  { method: 'PUT', path: '/api/v1/workloads/{id}', summary: 'Update a workload.' },
  { method: 'DELETE', path: '/api/v1/workloads/{id}', summary: 'Delete a workload.' },
  { method: 'GET', path: '/api/v1/placement/{id}', summary: 'Get placement recommendation.' },
  { method: 'GET', path: '/api/v1/cost/{id}', summary: 'Get cost comparison.' },
];

export const WORKLOAD_REQUEST_EXAMPLE = {
  applicationName: 'Example Application',
  cpuCores: 2,
  ramGb: 4,
  expectedUsers: 1000,
  monthlyBudget: 2000,
};

export class ApiError extends Error {
  constructor(message, { status = 0, kind = 'unknown' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

/* -------------------------------------------------- */
/* Base URL management                                */
/* -------------------------------------------------- */

export function getEnvironmentBaseUrl() {
  return ENV_BASE_URL;
}

export function getApiBaseUrl() {
  let saved = null;

  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    saved = null;
  }

  const value =
    saved && saved.trim() ? saved.trim() : ENV_BASE_URL;

  return value.replace(/\/+$/, '');
}

export function setApiBaseUrl(url) {
  const cleaned = (url || '').trim().replace(/\/+$/, '');

  try {
    if (!cleaned || cleaned === ENV_BASE_URL.replace(/\/+$/, '')) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, cleaned);
    }
  } catch (err) {
    // Storage unavailable.
  }
}

export function resetApiBaseUrl() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // No operation required.
  }
}

/* -------------------------------------------------- */
/* Core request                                       */
/* -------------------------------------------------- */

function buildUrl(path) {
  return `${getApiBaseUrl()}${path}`;
}

function extractMessage(payload, status) {
  if (payload && typeof payload === 'object') {
    const candidate =
      payload.message || payload.error || payload.detail;

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }

    if (Array.isArray(candidate) && candidate.length) {
      return candidate.map(String).join(' · ');
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim().slice(0, 300);
  }

  return `Backend responded with HTTP ${status}.`;
}

async function request(
  path,
  { method = 'GET', body, timeout = REQUEST_TIMEOUT_MS } = {}
) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeout
  );

  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: body
        ? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : {
            Accept: 'application/json',
          },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new ApiError(
        `Request to ${path} timed out after ${Math.round(timeout / 1000)} seconds.`,
        { kind: 'timeout' }
      );
    }

    throw new ApiError(
      `Unable to reach CloudScale X backend at ${
        getApiBaseUrl() || window.location.origin
      }. Check the backend and Nginx proxy configuration.`,
      { kind: 'network' }
    );
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();

  let payload = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch (err) {
      payload = raw;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload, response.status),
      {
        status: response.status,
        kind: 'http',
      }
    );
  }

  return payload;
}

/* -------------------------------------------------- */
/* Normalisation helpers                              */
/* -------------------------------------------------- */

export function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');

    if (!cleaned || cleaned === '-' || cleaned === '.') {
      return null;
    }

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

export function formatINR(value) {
  const n = toNumber(value);
  return n === null ? '—' : inrFormatter.format(n);
}

export function formatNumber(value) {
  const n = toNumber(value);
  return n === null ? '—' : numberFormatter.format(n);
}

function firstValue(source, keys) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
}

function withNested(source, keys) {
  const nested = firstValue(source, keys);

  return nested && typeof nested === 'object'
    ? { ...source, ...nested }
    : source;
}

export function normalizeWorkload(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return {
    id: toNumber(raw.id ?? raw.workloadId),

    applicationName: String(
      firstValue(raw, [
        'applicationName',
        'application_name',
        'appName',
        'name',
      ]) || 'Unnamed workload'
    ),

    cpuCores: toNumber(
      firstValue(raw, ['cpuCores', 'cpu_cores', 'cores', 'cpu'])
    ),

    ramGb: toNumber(
      firstValue(raw, ['ramGb', 'ram_gb', 'ramGB', 'ram'])
    ),

    expectedUsers: toNumber(
      firstValue(raw, ['expectedUsers', 'expected_users', 'users'])
    ),

    monthlyBudget: toNumber(
      firstValue(raw, ['monthlyBudget', 'monthly_budget', 'budget'])
    ),
  };
}

export function normalizePlatform(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim().toUpperCase();

  if (!text) return null;
  if (text.includes('AWS') || text.includes('CLOUD')) return 'AWS';

  if (
    text.includes('LOCAL') ||
    text.includes('ON-PREM') ||
    text.includes('ONPREM')
  ) {
    return 'LOCAL';
  }

  return text;
}

export function platformLabel(platform) {
  if (platform === 'LOCAL') return 'Local Infrastructure';
  if (platform === 'AWS') return 'AWS Cloud';

  return platform ? String(platform) : 'Not specified';
}

export function normalizePlacement(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = withNested(raw, [
    'data',
    'result',
    'placement',
    'recommendation',
    'response',
  ]);

  const platformRaw = firstValue(source, [
    'recommendedPlatform',
    'recommendation',
    'recommendedPlatformName',
    'platform',
    'placement',
    'decision',
    'result',
  ]);

  const platform = normalizePlatform(platformRaw);

  const reason = firstValue(source, [
    'recommendationReason',
    'reason',
    'explanation',
    'justification',
    'message',
    'description',
    'notes',
  ]);

  return {
    platform,
    platformLabel: platformLabel(
      platform || (platformRaw ? String(platformRaw) : null)
    ),
    reason: reason === null ? null : String(reason),
    raw,
  };
}

export function normalizeCost(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = withNested(raw, [
    'data',
    'result',
    'comparison',
    'costComparison',
    'response',
  ]);

  return {
    localMonthlyCost: toNumber(
      firstValue(source, [
        'estimatedLocalMonthlyCost',
        'estimatedLocalCost',
        'localMonthlyCost',
        'localEstimatedCost',
        'localCost',
        'local',
      ])
    ),

    awsMonthlyCost: toNumber(
      firstValue(source, [
        'estimatedAwsMonthlyCost',
        'estimatedAWSCost',
        'estimatedAwsCost',
        'awsMonthlyCost',
        'awsEstimatedCost',
        'awsCost',
        'aws',
      ])
    ),

    recommendedOption: normalizePlatform(
      firstValue(source, [
        'recommendedOption',
        'recommendation',
        'recommendedPlatform',
        'suggestedOption',
        'bestOption',
      ])
    ),

    estimatedSavings: toNumber(
      firstValue(source, [
        'estimatedSavings',
        'monthlySavings',
        'savings',
        'estimatedMonthlySavings',
        'totalSavings',
      ])
    ),

    explanation:
      firstValue(source, [
        'explanation',
        'reason',
        'justification',
        'description',
        'notes',
        'message',
      ]) === null
        ? null
        : String(
            firstValue(source, [
              'explanation',
              'reason',
              'justification',
              'description',
              'notes',
              'message',
            ])
          ),

    raw,
  };
}

function toRows(payload, keys) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (payload && Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  return null;
}

/* -------------------------------------------------- */
/* Workload API endpoints                             */
/* -------------------------------------------------- */

// GET /api/v1/workloads
export async function fetchWorkloads() {
  const payload = await request('/api/v1/workloads');

  const rows = toRows(payload, [
    'data',
    'workloads',
    'items',
    'content',
  ]);

  if (!rows) {
    throw new ApiError(
      'GET /api/v1/workloads returned an unexpected response shape.',
      { kind: 'shape' }
    );
  }

  return rows.map(normalizeWorkload).filter(Boolean);
}

// POST /api/v1/workloads
export async function createWorkload(payload) {
  const body = {
    applicationName: payload.applicationName,
    cpuCores: payload.cpuCores,
    ramGb: payload.ramGb,
    expectedUsers: payload.expectedUsers,
    monthlyBudget: payload.monthlyBudget,
  };

  const created = await request(
    '/api/v1/workloads',
    { method: 'POST', body }
  );

  return normalizeWorkload(created);
}

// GET /api/v1/workloads/{id}
export async function fetchWorkload(id) {
  const payload = await request(
    `/api/v1/workloads/${encodeURIComponent(id)}`
  );

  const workload = normalizeWorkload(
    payload && payload.data ? payload.data : payload
  );

  if (!workload) {
    throw new ApiError(
      `GET /api/v1/workloads/${id} returned an unexpected response shape.`,
      { kind: 'shape' }
    );
  }

  return workload;
}

// PUT /api/v1/workloads/{id}
export async function updateWorkload(id, payload) {
  const body = {
    applicationName: payload.applicationName,
    cpuCores: payload.cpuCores,
    ramGb: payload.ramGb,
    expectedUsers: payload.expectedUsers,
    monthlyBudget: payload.monthlyBudget,
  };

  const updated = await request(
    `/api/v1/workloads/${encodeURIComponent(id)}`,
    { method: 'PUT', body }
  );

  return normalizeWorkload(updated);
}

// DELETE /api/v1/workloads/{id}
export async function deleteWorkload(id) {
  return request(
    `/api/v1/workloads/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}

/* -------------------------------------------------- */
/* Placement API                                      */
/* -------------------------------------------------- */

// GET /api/v1/placement/{id}
export async function fetchPlacement(id) {
  const payload = await request(
    `/api/v1/placement/${encodeURIComponent(id)}`
  );

  return normalizePlacement(payload);
}

/* -------------------------------------------------- */
/* Cost API                                           */
/* -------------------------------------------------- */

// GET /api/v1/cost/{id}
export async function fetchCost(id) {
  const payload = await request(
    `/api/v1/cost/${encodeURIComponent(id)}`
  );

  return normalizeCost(payload);
}

/* -------------------------------------------------- */
/* Backend connection check                           */
/* -------------------------------------------------- */

export async function checkConnection() {
  const startedAt = Date.now();

  try {
    await request('/api/v1/workloads', {
      timeout: HEALTH_TIMEOUT_MS,
    });

    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      message: 'Backend connected.',
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: null,
      message:
        err && err.message
          ? err.message
          : 'Backend unreachable.',
    };
  }
}
