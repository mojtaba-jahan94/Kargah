import { getTursoClient } from './lib/turso.js';

export default async function handler(req, res) {
  const url = process.env.TURSO_DATABASE_URL;
  const isCloud = url && (url.startsWith('libsql:') || url.startsWith('https:'));
  const client = getTursoClient();

  if (!client) {
    return res.status(200).json({
      configured: false,
      status: 'unconfigured',
      message: 'تنظیمات دیتابیس Turso هنوز در متغیرهای محیطی Vercel ثبت نشده است.'
    });
  }

  try {
    const testResult = await client.execute('SELECT 1 as ping');
    return res.status(200).json({
      configured: true,
      status: 'connected',
      mode: isCloud ? 'turso_cloud' : 'local_sqlite',
      message: isCloud 
        ? 'ارتباط با پایگاه داده ابری Turso برقرار و پایدار است.' 
        : 'پایگاه داده در حالت توسعه محلی (Local SQLite) متصل است.',
      ping: testResult.rows[0]
    });
  } catch (err) {
    return res.status(200).json({
      configured: true,
      status: 'error',
      message: 'خطا در ارتباط با دیتابیس: ' + err.message
    });
  }
}
