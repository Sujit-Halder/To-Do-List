export const PREFERENCES_EVENT = 'taskpro-preferences';

export const getPreferences = () => ({
  theme: localStorage.getItem('taskpro-theme') || 'light',
  fontSize: localStorage.getItem('taskpro-font-size') || 'comfortable',
  motion: localStorage.getItem('taskpro-motion') || 'full',
});

export const applyPreferences = (preferences) => {
  const next = { ...getPreferences(), ...preferences };
  document.documentElement.dataset.theme = next.theme;
  document.documentElement.dataset.fontSize = next.fontSize;
  document.documentElement.dataset.motion = next.motion;
  localStorage.setItem('taskpro-theme', next.theme);
  localStorage.setItem('taskpro-font-size', next.fontSize);
  localStorage.setItem('taskpro-motion', next.motion);
  window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: next }));
  return next;
};
