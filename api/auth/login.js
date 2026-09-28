import bcrypt from 'bcryptjs';
import { getTursoClient, initDatabase, createAuthToken, readRequestBody } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'فقط متد POST مجاز است.' });
  }

  const client = getTursoClient();
  if (!client) {
    return res.status(503).json({
      error: 'TURSO_NOT_CONFIGURED',
      message: 'پایگاه داده Turso هنوز روی سرور ورسل تنظیم نشده است. لطفاً متغیرهای TURSO_DATABASE_URL و TURSO_AUTH_TOKEN را در تنظیمات Vercel اضافه کنید.'
    });
  }

  try {
    await initDatabase();

    const body = await readRequestBody(req);
    const { username, password } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
    }

    const result = await client.execute({
      sql: 'SELECT id, username, email, password_hash, full_name FROM users WHERE username = ? OR email = ? LIMIT 1',
      args: [cleanUsername, cleanUsername]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا رمز عبور اشتباه است.' });
    }

    const row = result.rows[0];
    const passwordMatch = await bcrypt.compare(cleanPassword, row.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا رمز عبور اشتباه است.' });
    }

    const userObj = {
      id: row.id,
      username: row.username,
      fullName: row.full_name || row.username,
      email: row.email || ''
    };

    const token = createAuthToken(userObj);

    return res.status(200).json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود.',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطای سرور در فرآیند ورود: ' + err.message });
  }
}
