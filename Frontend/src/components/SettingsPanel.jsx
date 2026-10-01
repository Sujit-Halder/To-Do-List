import React, { useState } from 'react';
import { FaAdjust, FaCheck, FaFont, FaRedo, FaRunning, FaSun } from 'react-icons/fa';
import { applyPreferences, getPreferences } from '../utils/preferences';

const choices = {
  theme: [
    { value: 'light', label: 'Light', description: 'Bright and clean', icon: FaSun },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: FaAdjust },
  ],
  fontSize: [
    { value: 'compact', label: 'Compact', description: 'More fits on screen' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced default' },
    { value: 'large', label: 'Large', description: 'Easier to read' },
  ],
  motion: [
    { value: 'full', label: 'Full motion', description: 'Hover and press feedback' },
    { value: 'reduced', label: 'Reduced', description: 'Minimize animation' },
  ],
};

const SettingsPanel = () => {
  const [preferences, setPreferences] = useState(getPreferences);
  const update = (key, value) => setPreferences(applyPreferences({ [key]: value }));
  const reset = () => setPreferences(applyPreferences({ theme: 'light', fontSize: 'comfortable', motion: 'full' }));

  const Choice = ({ group, option }) => {
    const Icon = option.icon;
    const active = preferences[group] === option.value;
    return <button type="button" onClick={() => update(group, option.value)} className={`interactive-card relative flex min-h-24 flex-col items-start rounded-2xl border p-4 text-left ${active ? 'border-red-300 bg-red-50/70 ring-2 ring-red-100' : 'border-slate-200 bg-white hover:border-slate-300'}`} aria-pressed={active} title={`Use ${option.label.toLowerCase()} ${group}`}>
      {active && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red-400 text-xs text-white"><FaCheck /></span>}
      {Icon && <Icon className="mb-3 text-lg text-red-400" />}
      <span className="font-semibold text-slate-800">{option.label}</span><span className="mt-1 text-xs text-slate-500">{option.description}</span>
    </button>;
  };

  return <div className="p-4 lg:p-6">
    <section className="surface-card mx-auto max-w-5xl p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><img src="/taskpro.svg" alt="" className="h-12 w-12" /><div><p className="text-xs font-semibold uppercase tracking-widest text-red-400">Preferences</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Make TaskPro+ comfortable for you.</p></div></div>
        <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95" title="Restore default appearance settings"><FaRedo /> Reset defaults</button>
      </div>

      <div className="mt-7 space-y-8">
        <div><div className="mb-3 flex items-center gap-2"><FaSun className="text-red-400" /><h2 className="font-semibold text-slate-800">Color theme</h2></div><div className="grid gap-3 sm:grid-cols-2">{choices.theme.map((option) => <Choice key={option.value} group="theme" option={option} />)}</div></div>
        <div><div className="mb-3 flex items-center gap-2"><FaFont className="text-red-400" /><h2 className="font-semibold text-slate-800">Text size</h2></div><div className="grid gap-3 sm:grid-cols-3">{choices.fontSize.map((option) => <Choice key={option.value} group="fontSize" option={option} />)}</div></div>
        <div><div className="mb-3 flex items-center gap-2"><FaRunning className="text-red-400" /><h2 className="font-semibold text-slate-800">Motion</h2></div><div className="grid gap-3 sm:grid-cols-2">{choices.motion.map((option) => <Choice key={option.value} group="motion" option={option} />)}</div></div>
      </div>
      <p className="mt-7 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Appearance settings are saved on this device and apply immediately. They do not change your account data.</p>
    </section>
  </div>;
};

export default SettingsPanel;
