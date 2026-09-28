import { getDatabase } from './lib/db.js';

export default async function handler(req, res) {
  const db = getDatabase();

  if (!db) {
    return res.status(200).json({
      configured: false,
      status: 'unconfigured',
      message: 'پایگاه داده هنوز در پنل Vercel متصل نشده است. از تب Storage در داشبورد Vercel روی Create Database کلیک کنید.'
    });
  }

  try {
    let pingResult;
    if (db.type === 'postgres') {
      const rows = await db.client`SELECT 1 as ping`;
      pingResult = rows[0];
    } else {
      const r = await db.client.execute('SELECT 1 as ping');
      pingResult = r.rows[0];
    }

    return res.status(200).json({
      configured: true,
      status: 'connected',
      engine: db.type,
      name: db.name,
      message: `پایگاه داده ابری (${db.name}) متصل و فعال است.`,
      ping: pingResult
    });
  } catch (err) {
    return res.status(200).json({
      configured: true,
      status: 'error',
      engine: db.type,
      message: 'خطا در ارتباط با دیتابیس: ' + err.message
    });
  }
}
