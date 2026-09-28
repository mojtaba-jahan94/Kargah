import bcrypt from 'bcryptjs';
import { 
  getDatabase, 
  initDatabase, 
  findUserById, 
  deleteUserAndData, 
  verifyAuthToken, 
  readRequestBody 
} from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'فقط متد POST مجاز است.' });
  }

  const payload = verifyAuthToken(req);
  if (!payload) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'برای حذف حساب کاربری باید ابتدا وارد شوید.'
    });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({
      error: 'DATABASE_NOT_CONFIGURED',
      message: 'پایگاه داده متصل نیست.'
    });
  }

  try {
    await initDatabase();
    const body = await readRequestBody(req);
    const { password } = body;

    if (!password) {
      return res.status(400).json({
        error: 'PASSWORD_REQUIRED',
        message: 'برای تایید حذف حساب، وارد کردن رمز عبور الزامی است.'
      });
    }

    const userId = payload.userId;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'حساب کاربری یافت نشد.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(403).json({
        error: 'INVALID_PASSWORD',
        message: 'رمز عبور وارد شده نادرست است.'
      });
    }

    // Delete user and associated data
    await deleteUserAndData(userId);

    return res.status(200).json({
      success: true,
      message: 'حساب کاربری و کلیه داده‌های آن با موفقیت از سرور حذف گردید.'
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'خطا در حذف حساب کاربری: ' + err.message
    });
  }
}
