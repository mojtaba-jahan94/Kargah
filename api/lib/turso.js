import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import jwt from 'jsonwebtoken';

// Try loading local .env if available
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // Ignore in production or serverless environments
}

const JWT_SECRET = process.env.JWT_SECRET || 'kargah-secret-session-key-2026';

let tursoClient = null;

export function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoClient) {
    return tursoClient;
  }

  // 1. Explicit file: URL (local SQLite)
  if (url && url.startsWith('file:')) {
    tursoClient = createClient({ url });
    return tursoClient;
  }

  // 2. Turso Cloud URL
  if (url && authToken) {
    tursoClient = createClient({
      url,
      authToken,
    });
    return tursoClient;
  }

  // 3. In local development (not on Vercel), fallback to local SQLite database
  if (!process.env.VERCEL) {
    tursoClient = createClient({
      url: 'file:local.db',
    });
    return tursoClient;
  }

  // Missing config on Vercel
  return null;
}

export async function initDatabase() {
  const client = getTursoClient();
  if (!client) {
    return {
      success: false,
      error: 'TURSO_ENV_MISSING',
      message: 'متغیرهای محیطی TURSO_DATABASE_URL یا TURSO_AUTH_TOKEN تنظیم نشده‌اند.'
    };
  }

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        created_at TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY,
        locations_json TEXT NOT NULL,
        students_json TEXT NOT NULL,
        payments_json TEXT NOT NULL,
        settings_json TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    return { success: true };
  } catch (err) {
    console.error('Failed to initialize Turso database tables:', err);
    return { success: false, error: err.message };
  }
}

export function createAuthToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      fullName: user.full_name || user.fullName || user.username,
      email: user.email || '',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyAuthToken(req) {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function readRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}
