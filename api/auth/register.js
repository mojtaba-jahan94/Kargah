import bcrypt from 'bcryptjs';
import { getTursoClient, initDatabase, createAuthToken, readRequestBody } from '../lib/turso.js';

export default async function handler(req, res) {
  // CORS & Methods
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
      message: 'پایگاه داده Turso هنوز روی سرور ورسل تنظیم نشده است. لطفاً مقادیر TURSO_DATABASE_URL و TURSO_AUTH_TOKEN را در متغیرهای محیطی Vercel قرار دهید.'
    });
  }

  try {
    await initDatabase();

    const body = await readRequestBody(req);
    const { username, password, fullName, email, initialData } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      return res.status(400).json({ error: 'INVALID_USERNAME', message: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' });
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' });
    }

    // Check if user already exists
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)',
      args: [cleanUsername, email ? email.trim().toLowerCase() : '']
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'USER_EXISTS', message: 'کاربری با این نام کاربری یا ایمیل قبلاً ثبت‌نام کرده است.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        userId,
        cleanUsername,
        email ? email.trim().toLowerCase() : null,
        passwordHash,
        fullName ? fullName.trim() : cleanUsername,
        nowIso
      ]
    });

    // Save initial data if provided
    const locationsJson = JSON.stringify(initialData?.locations || []);
    const studentsJson = JSON.stringify(initialData?.students || []);
    const paymentsJson = JSON.stringify(initialData?.payments || []);
    const settingsJson = JSON.stringify(initialData?.settings || {});

    await client.execute({
      sql: `INSERT INTO user_data (user_id, locations_json, students_json, payments_json, settings_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [userId, locationsJson, studentsJson, paymentsJson, settingsJson, nowIso]
    });

    const userObj = {
      id: userId,
      username: cleanUsername,
      fullName: fullName ? fullName.trim() : cleanUsername,
      email: email ? email.trim() : ''
    };

    const token = createAuthToken(userObj);

    return res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد.',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطایی در ثبت‌نام رخ داد: ' + err.message });
  }
}
