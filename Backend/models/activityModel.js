const { db } = require('../database');

const normalizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return null;
  const safe = { ...metadata };
  for (const key of ['password', 'token', 'authorization', 'emailPass', 'authToken']) delete safe[key];
  return Object.keys(safe).length ? JSON.stringify(safe) : null;
};

exports.record = async ({ userId, email, level = 'info', eventType, message, metadata }) => {
  const owner = userId
    ? { id: userId }
    : db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (!owner) return false;
  db.prepare(`
    INSERT INTO activity_logs (user_id, level, event_type, message, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).run(owner.id, level, eventType, message, normalizeMetadata(metadata));
  return true;
};

exports.listForUser = async (email, { limit = 50, offset = 0, level, eventType } = {}) => {
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const safeOffset = Math.max(0, Number(offset) || 0);
  const filters = ['al.user_id = (SELECT id FROM users WHERE email = ? COLLATE NOCASE)'];
  const params = [email];
  if (['info', 'warning', 'error'].includes(level)) { filters.push('al.level = ?'); params.push(level); }
  if (eventType) { filters.push('al.event_type = ?'); params.push(eventType); }

  const rows = db.prepare(`
    SELECT al.id, al.level, al.event_type AS eventType, al.message, al.metadata, al.created_at AS createdAt
    FROM activity_logs al WHERE ${filters.join(' AND ')}
    ORDER BY al.created_at DESC, al.id DESC LIMIT ? OFFSET ?
  `).all(...params, safeLimit, safeOffset);
  const total = db.prepare(`SELECT COUNT(*) AS count FROM activity_logs al WHERE ${filters.join(' AND ')}`).get(...params).count;
  return {
    items: rows.map((row) => ({ ...row, metadata: row.metadata ? JSON.parse(row.metadata) : null })),
    pagination: { total, limit: safeLimit, offset: safeOffset, hasMore: safeOffset + rows.length < total },
  };
};
