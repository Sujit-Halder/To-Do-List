export const NOTIFICATION_EVENT = 'taskpro-notification';

export const notify = (message, type = 'info', options = {}) => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, {
    detail: { id: crypto.randomUUID(), message, type, duration: options.duration ?? 4200 },
  }));
};
