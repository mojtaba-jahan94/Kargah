import bcrypt from 'bcryptjs';
import { 
  getDatabase, 
  initDatabase, 
  findUserByUsernameOrEmail, 
  createUser, 
  saveUserData, 
  createAuthToken, 
  readRequestBody 
} from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'فقط متد POST مجاز است.' });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({
      error: 'DATABASE_NOT_CONFIGURED',
      message: 'پایگاه داده هنوز متصل نشده است. در پنل Vercel وارد تب Storage شوید و روی Create Database کلیک کنید.'
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
    const existing = await findUserByUsernameOrEmail(cleanUsername);
    if (existing) {
      return res.status(409).json({ error: 'USER_EXISTS', message: 'کاربری با این نام کاربری قبلاً ثبت‌نام کرده است.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    await createUser({
      id: userId,
      username: cleanUsername,
      email: email ? email.trim().toLowerCase() : null,
      passwordHash,
      fullName: fullName ? fullName.trim() : cleanUsername,
      createdAt: nowIso
    });

    // Save initial data if provided
    const locationsJson = JSON.stringify(initialData?.locations || []);
    const studentsJson = JSON.stringify(initialData?.students || []);
    const paymentsJson = JSON.stringify(initialData?.payments || []);
    const settingsJson = JSON.stringify(initialData?.settings || {});

    await saveUserData(userId, {
      locationsJson,
      studentsJson,
      paymentsJson,
      settingsJson,
      updatedAt: nowIso
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
