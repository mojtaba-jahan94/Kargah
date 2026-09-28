import bcrypt from 'bcryptjs';
import { 
  getDatabase, 
  initDatabase, 
  findUserByUsernameOrEmail, 
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
    const { username, password } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
    }

    const user = await findUserByUsernameOrEmail(cleanUsername);
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا رمز عبور اشتباه است.' });
    }

    const passwordMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'نام کاربری یا رمز عبور اشتباه است.' });
    }

    const userObj = {
      id: user.id,
      username: user.username,
      fullName: user.full_name || user.username,
      email: user.email || ''
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
