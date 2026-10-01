import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaFont, FaMoon, FaSearch, FaSun, FaTimes } from 'react-icons/fa';
import { applyPreferences, getPreferences, PREFERENCES_EVENT } from '../utils/preferences';

const Header = React.memo(({ user }) => {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState(() => getPreferences().theme);
  const [fontSize, setFontSize] = useState(() => getPreferences().fontSize);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyPreferences({ theme, fontSize });
  }, [theme, fontSize]);

  useEffect(() => {
    const syncPreferences = (event) => {
      setTheme(event.detail.theme);
      setFontSize(event.detail.fontSize);
    };
    window.addEventListener(PREFERENCES_EVENT, syncPreferences);
    return () => window.removeEventListener(PREFERENCES_EVENT, syncPreferences);
  }, []);

  const results = useMemo(() => {
    const query = submittedSearch.trim().toLowerCase();
    if (!query) return [];
    return (user?.tasklists || []).flatMap((list) => list.tasks || [])
      .filter((task) => task.title?.toLowerCase().includes(query));
  }, [submittedSearch, user]);

  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const handleSubmit = (event) => { event.preventDefault(); setSubmittedSearch(search); };

  return (
    <header className="relative z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4">
        <a href="/dashboard" className="ml-11 flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-slate-900 md:ml-0 md:text-2xl" aria-label="TaskPro dashboard home">
          <img src="/taskpro.svg" alt="" className="h-9 w-9" />
          <span className="hidden sm:inline"><span className="text-red-400">Task</span>Pro+</span>
        </a>
        <form onSubmit={handleSubmit} className="relative ml-auto w-full max-w-xl">
          <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input name="search" type="search" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} className="field-control py-2 pl-10" aria-label="Search tasks" title="Type a task title and press Enter to search" />
        </form>
        <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 text-sm text-slate-500 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-400"><FaCalendarAlt /></span>
          <span className="hidden whitespace-nowrap font-medium xl:block">{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setFontSize((current) => current === 'compact' ? 'comfortable' : current === 'comfortable' ? 'large' : 'compact')} className="header-tool" title={`Font size: ${fontSize}. Click to change.`} aria-label={`Change font size. Current size: ${fontSize}`}><FaFont /></button>
          <button type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} className="header-tool" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <FaSun /> : <FaMoon />}</button>
        </div>
      </div>
      {submittedSearch && (
        <div className="surface-card absolute right-4 top-[calc(100%+8px)] w-[min(92vw,36rem)] p-3 lg:right-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">{results.length} search result{results.length === 1 ? '' : 's'}</p>
            <button type="button" onClick={() => { setSubmittedSearch(''); setSearch(''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close search results"><FaTimes /></button>
          </div>
          {results.length ? <ul className="max-h-64 space-y-1 overflow-y-auto">{results.map((task) => <li key={task.id || task.title} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{task.title}</li>)}</ul> : <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">No tasks match “{submittedSearch}”.</p>}
        </div>
      )}
    </header>
  );
});

export default Header;
