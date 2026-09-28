import { getTursoClient, verifyAuthToken, readRequestBody, initDatabase } from './lib/turso.js';

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

  const client = getTursoClient();
  if (!client) {
    return res.status(503).json({
      error: 'TURSO_NOT_CONFIGURED',
      message: 'پایگاه داده Turso هنوز روی سرور ورسل متصل نشده است. متغیرهای TURSO_DATABASE_URL و TURSO_AUTH_TOKEN را در Vercel ثبت نمایید.'
    });
  }

  const userId = payload.userId;

  // GET: Fetch user data from Turso
  if (req.method === 'GET') {
    try {
      await initDatabase();
      const result = await client.execute({
        sql: 'SELECT locations_json, students_json, payments_json, settings_json, updated_at FROM user_data WHERE user_id = ? LIMIT 1',
        args: [userId]
      });

      if (result.rows.length === 0) {
        // No server data yet for this user
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

      const row = result.rows[0];
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

  // POST or PUT: Save/Sync user data to Turso
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

      // SQLite UPSERT syntax
      await client.execute({
        sql: `
          INSERT INTO user_data (user_id, locations_json, students_json, payments_json, settings_json, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            locations_json = excluded.locations_json,
            students_json = excluded.students_json,
            payments_json = excluded.payments_json,
            settings_json = excluded.settings_json,
            updated_at = excluded.updated_at
        `,
        args: [userId, locationsJson, studentsJson, paymentsJson, settingsJson, nowIso]
      });

      return res.status(200).json({
        success: true,
        message: 'اطلاعات با موفقیت روی سرور (Turso) ذخیره و همگام شد.',
        updatedAt: nowIso
      });
    } catch (err) {
      console.error('Save data error:', err);
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'خطا در ذخیره داده‌ها روی سرور: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'متد نامعتبر است.' });
}
