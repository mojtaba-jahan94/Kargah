import { getDatabase, findUserById, verifyAuthToken } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = verifyAuthToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'توکن نامعتبر یا منقضی شده است.' });
  }

  const db = getDatabase();
  if (!db) {
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
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'کاربر یافت نشد.' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name || user.username,
        email: user.email || '',
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطای سرور' });
  }
}
