import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaRedo } from 'react-icons/fa';

const levelStyles = {
  info: { icon: FaInfoCircle, badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  warning: { icon: FaExclamationTriangle, badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  error: { icon: FaExclamationTriangle, badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

const ActivityLog = () => {
  const [items, setItems] = useState([]);
  const [level, setLevel] = useState('');
  const [pagination, setPagination] = useState({ total: 0, hasMore: false, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivity = useCallback(async ({ append = false, nextOffset = 0 } = {}) => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 30, offset: nextOffset, ...(level ? { level } : {}) },
      });
      setItems((current) => append ? [...current, ...response.data.items] : response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Activity could not be loaded. Please try again.');
    } finally { setLoading(false); }
  }, [level]);

  useEffect(() => { loadActivity(); }, [loadActivity]);

  return (
    <div className="p-4 lg:p-6">
      <section className="surface-card mx-auto max-w-5xl overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Audit trail</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Activity log</h1>
            <p className="mt-1 text-sm text-slate-500">A readable history of account events, changes, warnings, and errors.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={level} onChange={(event) => setLevel(event.target.value)} className="field-control w-auto" title="Filter activity by severity" aria-label="Filter activity by severity">
              <option value="">All activity</option><option value="info">Information</option><option value="warning">Warnings</option><option value="error">Errors</option>
            </select>
            <button type="button" onClick={() => loadActivity()} className="header-tool" title="Refresh activity" aria-label="Refresh activity"><FaRedo /></button>
          </div>
        </header>

        <div className="p-4 sm:p-5">
          {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {!loading && !items.length && !error && <div className="py-16 text-center"><FaCheckCircle className="mx-auto mb-3 text-3xl text-emerald-500" /><p className="font-semibold text-slate-800">No activity yet</p><p className="mt-1 text-sm text-slate-500">Events will appear here as you use TaskPro+.</p></div>}
          <ol className="space-y-2">
            {items.map((item) => {
              const style = levelStyles[item.level] || levelStyles.info;
              const Icon = style.icon;
              return <li key={item.id} className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50/60">
                <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${style.badge}`}><Icon /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-800">{item.message}</p><span className={`h-2 w-2 rounded-full ${style.dot}`} title={item.level} /></div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400"><span>{item.eventType.replaceAll('.', ' · ')}</span><time dateTime={item.createdAt}>{new Date(`${item.createdAt.replace(' ', 'T')}Z`).toLocaleString()}</time></div>
                </div>
              </li>;
            })}
          </ol>
          {loading && <p className="py-8 text-center text-sm text-slate-500">Loading activity…</p>}
          {pagination.hasMore && !loading && <div className="mt-4 text-center"><button type="button" onClick={() => loadActivity({ append: true, nextOffset: pagination.offset + pagination.limit })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" title="Load older activity">Load older activity</button></div>}
        </div>
      </section>
    </div>
  );
};

export default ActivityLog;
