/**
 * useRealtime.js
 *
 * A drop-in hook that listens to the `tickets:update` Socket.IO event and
 * re-fetches ticket data automatically whenever the server broadcasts a change.
 *
 * Usage:
 *   const { tickets, loading, refresh } = useRealtime('/tickets', token);
 *
 * @param {string} endpoint  – axios endpoint relative to baseURL, e.g. '/tickets'
 * @param {string} token     – JWT token for the Authorization header
 * @param {object} [options] – optional config { onUpdate }
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api    from '../services/api';
import socket from '../services/socket';

export function useRealtime(endpoint, token, options = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Keep stable ref for the onUpdate callback so we don't re-register listeners
  const onUpdateRef = useRef(options.onUpdate);
  useEffect(() => { onUpdateRef.current = options.onUpdate; }, [options.onUpdate]);

  const fetch = useCallback(async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res     = await api.get(endpoint, { headers });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, token]);

  // Initial fetch
  useEffect(() => {
    if (token) fetch();
  }, [fetch, token]);

  // Real-time listener
  useEffect(() => {
    const handler = (payload) => {
      setLastUpdate({ ...payload, at: Date.now() });
      fetch(); // re-fetch full list on any server-side change
      if (onUpdateRef.current) onUpdateRef.current(payload);
    };

    socket.on('tickets:update', handler);
    return () => socket.off('tickets:update', handler);
  }, [fetch]);

  return { data, loading, error, refresh: fetch, lastUpdate };
}
