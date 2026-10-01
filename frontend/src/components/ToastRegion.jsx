import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { NOTIFICATION_EVENT } from '../utils/notifications';

const styles = {
  success: { icon: FaCheckCircle, color: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: FaExclamationCircle, color: 'text-red-500', bar: 'bg-red-500' },
  warning: { icon: FaExclamationCircle, color: 'text-amber-600', bar: 'bg-amber-500' },
  info: { icon: FaInfoCircle, color: 'text-blue-600', bar: 'bg-blue-500' },
};

const ToastRegion = () => {
  const [toasts, setToasts] = useState([]);
  const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));

  useEffect(() => {
    const receive = (event) => {
      const toast = event.detail;
      setToasts((current) => [...current.slice(-3), toast]);
      window.setTimeout(() => dismiss(toast.id), toast.duration);
    };
    window.addEventListener(NOTIFICATION_EVENT, receive);
    return () => window.removeEventListener(NOTIFICATION_EVENT, receive);
  }, []);

  return <div className="pointer-events-none fixed right-3 top-3 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" role="region" aria-label="Notifications" aria-live="polite">
    {toasts.map((toast) => { const style = styles[toast.type] || styles.info; const Icon = style.icon; return <div key={toast.id} className="pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pr-11 text-slate-700 shadow-2xl animate-[toast-in_220ms_ease-out]">
      <div className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
      <div className="flex items-start gap-3"><Icon className={`mt-0.5 shrink-0 text-lg ${style.color}`} /><p className="text-sm font-medium leading-5">{toast.message}</p></div>
      <button type="button" onClick={() => dismiss(toast.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-90" aria-label="Dismiss notification"><FaTimes /></button>
    </div>; })}
  </div>;
};

export default ToastRegion;
