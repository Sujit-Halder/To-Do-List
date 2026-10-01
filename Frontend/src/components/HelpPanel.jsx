import React, { useMemo, useState } from 'react';
import { FaBookOpen, FaChevronDown, FaKeyboard, FaQuestionCircle, FaSearch, FaShieldAlt } from 'react-icons/fa';

const topics = [
  { question: 'How do I create a task?', answer: 'Open Dashboard or choose a task category, then select Add Task. Add a title, due date, time and priority before saving.', tags: 'task create add' },
  { question: 'How do reminders work?', answer: 'Enable email notifications on a task. The server sends a reminder during the configured reminder window. SMS is also sent when Twilio is configured and your account has a phone number.', tags: 'email sms notification reminder' },
  { question: 'Where can I see account activity?', answer: 'Choose Activity Log in the sidebar. Filter by information, warning or error to find a specific type of event.', tags: 'activity audit errors history' },
  { question: 'How are overdue tasks handled?', answer: 'The server checks due times every minute. Unfinished tasks past their due time move to Overdue automatically.', tags: 'overdue scheduler status' },
  { question: 'Can I change the appearance?', answer: 'Use the moon and font buttons in the top-right, or open Settings for theme, text size and motion options.', tags: 'theme dark font motion settings' },
  { question: 'Why was I signed out?', answer: 'For security, access tokens expire after one hour. Sign in again to continue. If it happens immediately, ask the server administrator to verify JWT configuration.', tags: 'login token session security' },
];

const HelpPanel = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(0);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? topics.filter((topic) => `${topic.question} ${topic.answer} ${topic.tags}`.toLowerCase().includes(query)) : topics;
  }, [search]);

  return <div className="p-4 lg:p-6">
    <section className="surface-card mx-auto max-w-5xl overflow-hidden">
      <div className="bg-gradient-to-br from-red-400 to-red-500 p-6 text-white sm:p-8">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-xl"><FaQuestionCircle /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-white/75">Support center</p><h1 className="mt-1 text-2xl font-bold">How can we help?</h1></div></div>
        <div className="relative mt-6 max-w-2xl"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help topics…" className="w-full rounded-xl border border-white/20 bg-white/15 py-3 pl-11 pr-4 text-white outline-none placeholder:text-white/65 focus:bg-white/20 focus:ring-4 focus:ring-white/15" title="Search TaskPro+ help" /></div>
      </div>

      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_260px]">
        <div><h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800"><FaBookOpen className="text-red-400" /> Frequently asked questions</h2><div className="space-y-2">{filtered.map((topic) => { const index = topics.indexOf(topic); const expanded = open === index; return <div key={topic.question} className="overflow-hidden rounded-xl border border-slate-200"><button type="button" onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium text-slate-800 transition hover:bg-slate-50 active:bg-red-50" aria-expanded={expanded}><span>{topic.question}</span><FaChevronDown className={`shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} /></button>{expanded && <p className="border-t border-slate-100 bg-slate-50/50 p-4 text-sm leading-6 text-slate-600">{topic.answer}</p>}</div>; })}{!filtered.length && <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No help topic matches “{search}”.</p>}</div></div>
        <aside className="space-y-3"><div className="rounded-2xl bg-slate-50 p-5"><FaKeyboard className="mb-3 text-xl text-red-400" /><h3 className="font-semibold text-slate-800">Quick tips</h3><ul className="mt-3 space-y-2 text-sm text-slate-500"><li><kbd>Enter</kbd> runs task search.</li><li>Use filters to narrow long lists.</li><li>Tap cards for touch feedback.</li></ul></div><div className="rounded-2xl bg-emerald-50 p-5"><FaShieldAlt className="mb-3 text-xl text-emerald-600" /><h3 className="font-semibold text-emerald-900">Privacy</h3><p className="mt-2 text-sm leading-6 text-emerald-800">Activity is private to your account. Passwords and credentials are never included in the readable log.</p></div></aside>
      </div>
    </section>
  </div>;
};

export default HelpPanel;
