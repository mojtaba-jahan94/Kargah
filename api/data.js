import { 
  getDatabase, 
  initDatabase, 
  getUserData, 
  saveUserData, 
  verifyAuthToken, 
  readRequestBody 
} from './lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = verifyAuthToken(req);
  if (!payload) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'برای ذخیره یا دریافت اطلاعات از سرور باید ابتدا وارد حساب خود شوید.'
    });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({
      error: 'DATABASE_NOT_CONFIGURED',
      message: 'پایگاه داده هنوز متصل نشده است. در پنل Vercel وارد تب Storage شوید و روی Create Database کلیک کنید.'
    });
  }

  const userId = payload.userId;

  // GET: Fetch user data
  if (req.method === 'GET') {
    try {
      await initDatabase();
      const row = await getUserData(userId);

      if (!row) {
        return res.status(200).json({
          found: false,
          locations: null,
          students: null,
          payments: null,
          settings: null,
          updatedAt: null,
          message: 'هنوز داده‌ای روی سرور برای این حساب ثبت نشده است.'
        });
      }

      return res.status(200).json({
        found: true,
        locations: JSON.parse(row.locations_json || '[]'),
        students: JSON.parse(row.students_json || '[]'),
        payments: JSON.parse(row.payments_json || '[]'),
        settings: JSON.parse(row.settings_json || '{}'),
        updatedAt: row.updated_at
      });
    } catch (err) {
      console.error('Fetch data error:', err);
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطا در بارگذاری داده‌ها از سرور: ' + err.message });
    }
  }

  // POST or PUT: Save/Sync user data
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      await initDatabase();
      const body = await readRequestBody(req);
      const { locations, students, payments, settings } = body;

      const locationsJson = JSON.stringify(locations || []);
      const studentsJson = JSON.stringify(students || []);
      const paymentsJson = JSON.stringify(payments || []);
      const settingsJson = JSON.stringify(settings || {});
      const nowIso = new Date().toISOString();

      await saveUserData(userId, {
        locationsJson,
        studentsJson,
        paymentsJson,
        settingsJson,
        updatedAt: nowIso
      });

      return res.status(200).json({
        success: true,
        message: 'اطلاعات با موفقیت روی سرور ذخیره و همگام شد.',
        updatedAt: nowIso
      });
    } catch (err) {
      console.error('Save data error:', err);
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطا در ذخیره داده‌ها روی سرور: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'متد نامعتبر است.' });
}
