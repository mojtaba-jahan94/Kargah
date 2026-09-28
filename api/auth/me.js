import { getTursoClient, verifyAuthToken } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = verifyAuthToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'توکن نامعتبر یا منقضی شده است.' });
  }

  const client = getTursoClient();
  if (!client) {
    // If Turso is not configured yet, return user from token
    return res.status(200).json({
      user: {
        id: payload.userId,
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email
      }
    });
  }

  try {
    const result = await client.execute({
      sql: 'SELECT id, username, email, full_name, created_at FROM users WHERE id = ? LIMIT 1',
      args: [payload.userId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'کاربر یافت نشد.' });
    }

    const row = result.rows[0];
    return res.status(200).json({
      user: {
        id: row.id,
        username: row.username,
        fullName: row.full_name || row.username,
        email: row.email || '',
        createdAt: row.created_at
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطای سرور' });
  }
}
