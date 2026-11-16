import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  checkConnection,
  fetchWorkloads,
  getApiBaseUrl,
  setApiBaseUrl as persistBaseUrl,
} from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [workloads, setWorkloads] = useState([]);
  const [workloadsLoading, setWorkloadsLoading] = useState(true);
  const [workloadsError, setWorkloadsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl());
  const [connection, setConnection] = useState({
    status: 'checking',
    latencyMs: null,
    message: 'Checking backend connection…',
    checkedAt: null,
  });

  const checkBackend = useCallback(async () => {
    setConnection((prev) => ({
      ...prev,
      status: 'checking',
      message: 'Checking backend connection…',
    }));
    const result = await checkConnection();
    setConnection({
      status: result.ok ? 'online' : 'offline',
      latencyMs: result.latencyMs,
      message: result.message,
      checkedAt: new Date().toISOString(),
    });
    return result;
  }, []);

  const refreshWorkloads = useCallback(async () => {
    setWorkloadsLoading(true);
    setWorkloadsError(null);
    try {
      const rows = await fetchWorkloads();
      setWorkloads(rows);
    } catch (err) {
      setWorkloads([]);
      setWorkloadsError(err);
    } finally {
      setWorkloadsLoading(false);
      setLastUpdated(new Date().toISOString());
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([checkBackend(), refreshWorkloads()]);
    setRefreshing(false);
  }, [checkBackend, refreshWorkloads]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const updateApiBaseUrl = useCallback(
    (url) => {
      persistBaseUrl(url);
      setApiBaseUrlState(getApiBaseUrl());
    },
    [],
  );

  const value = useMemo(
    () => ({
      workloads,
      workloadsLoading,
      workloadsError,
      refreshWorkloads,
      connection,
      checkBackend,
      refreshing,
      refreshAll,
      lastUpdated,
      apiBaseUrl,
      updateApiBaseUrl,
    }),
    [
      workloads,
      workloadsLoading,
      workloadsError,
      refreshWorkloads,
      connection,
      checkBackend,
      refreshing,
      refreshAll,
      lastUpdated,
      apiBaseUrl,
      updateApiBaseUrl,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
