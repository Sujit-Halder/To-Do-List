const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

module.exports = ({ userName, taskTitle, taskDueDate, reminderMinutes }) => {
  const due = new Date(taskDueDate).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  return `<!doctype html>
  <html><body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#20232d">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f5f7fb"><tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;overflow:hidden;border:1px solid #e7e9ef;border-radius:20px;background:#ffffff">
        <tr><td style="padding:28px 32px;background:#ff6b6f;color:#ffffff">
          <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase">TaskPro+</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2">A task is coming up</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.6">Hi ${escapeHtml(userName)},</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6">Here is your ${Number(reminderMinutes)}-minute reminder for:</p>
          <div style="padding:20px;border-left:4px solid #ff6b6f;border-radius:12px;background:#fff5f5">
            <div style="font-size:19px;font-weight:700">${escapeHtml(taskTitle)}</div>
            <div style="margin-top:8px;color:#667085;font-size:14px">Due ${escapeHtml(due)}</div>
          </div>
          <p style="margin:24px 0 0;color:#667085;font-size:14px;line-height:1.6">Open TaskPro+ to review the task or mark it complete.</p>
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #eef0f4;color:#98a2b3;font-size:12px">You received this because email reminders are enabled for this task.</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
};
