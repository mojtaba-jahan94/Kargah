import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { neon } from '@neondatabase/serverless';
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

let activeEngine = null; // { type: 'postgres' | 'turso' | 'local_sqlite', client: any }

export function getDatabase() {
  if (activeEngine) return activeEngine;

  // 1. Vercel Postgres / Neon (Auto-configured by Vercel Storage)
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (postgresUrl && (postgresUrl.startsWith('postgres://') || postgresUrl.startsWith('postgresql://'))) {
    const sql = neon(postgresUrl);
    activeEngine = {
      type: 'postgres',
      name: 'Vercel Postgres (Neon)',
      client: sql,
    };
    return activeEngine;
  }

  // 2. Turso Cloud / LibSQL
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://')) && tursoAuthToken) {
    const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    activeEngine = {
      type: 'turso',
      name: 'Turso Cloud',
      client,
    };
    return activeEngine;
  }

  // 3. Explicit SQLite file URL
  if (tursoUrl && tursoUrl.startsWith('file:')) {
    const client = createClient({ url: tursoUrl });
    activeEngine = {
      type: 'local_sqlite',
      name: 'Local SQLite File',
      client,
    };
    return activeEngine;
  }

  // 4. Local Development Fallback (When running locally outside Vercel)
  if (!process.env.VERCEL) {
    const client = createClient({ url: 'file:local.db' });
    activeEngine = {
      type: 'local_sqlite',
      name: 'Local SQLite (Dev)',
      client,
    };
    return activeEngine;
  }

  return null;
}

export async function initDatabase() {
  const db = getDatabase();
  if (!db) {
    return {
      success: false,
      error: 'NO_DATABASE_CONFIGURED',
      message: 'هنوز دیتابیسی به ورسل متصل نشده است. از تب Storage در پنل Vercel روی Create Database کلیک کنید.'
    };
  }

  try {
    if (db.type === 'postgres') {
      const sql = db.client;
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(255),
          created_at VARCHAR(255) NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS user_data (
          user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          locations_json TEXT NOT NULL,
          students_json TEXT NOT NULL,
          payments_json TEXT NOT NULL,
          settings_json TEXT,
          updated_at VARCHAR(255) NOT NULL
        );
      `;
    } else {
      // Turso or Local SQLite
      const client = db.client;
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
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
    return { success: false, error: err.message };
  }
}

// User queries
export async function findUserByUsernameOrEmail(identifier) {
  const db = getDatabase();
  if (!db) return null;

  const clean = (identifier || '').trim().toLowerCase();
  if (db.type === 'postgres') {
    const rows = await db.client`
      SELECT id, username, email, password_hash, full_name, created_at
      FROM users
      WHERE LOWER(username) = ${clean} OR LOWER(email) = ${clean}
      LIMIT 1
    `;
    return rows[0] || null;
  } else {
    const res = await db.client.execute({
      sql: 'SELECT id, username, email, password_hash, full_name, created_at FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
      args: [clean, clean]
    });
    return res.rows[0] || null;
  }
}

export async function findUserById(userId) {
  const db = getDatabase();
  if (!db) return null;

  if (db.type === 'postgres') {
    const rows = await db.client`
      SELECT id, username, email, full_name, created_at
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    return rows[0] || null;
  } else {
    const res = await db.client.execute({
      sql: 'SELECT id, username, email, full_name, created_at FROM users WHERE id = ? LIMIT 1',
      args: [userId]
    });
    return res.rows[0] || null;
  }
}

export async function createUser({ id, username, email, passwordHash, fullName, createdAt }) {
  const db = getDatabase();
  if (!db) throw new Error('Database not configured');

  if (db.type === 'postgres') {
    await db.client`
      INSERT INTO users (id, username, email, password_hash, full_name, created_at)
      VALUES (${id}, ${username}, ${email || null}, ${passwordHash}, ${fullName || username}, ${createdAt})
    `;
  } else {
    await db.client.execute({
      sql: 'INSERT INTO users (id, username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, username, email || null, passwordHash, fullName || username, createdAt]
    });
  }
}

// Data queries
export async function getUserData(userId) {
  const db = getDatabase();
  if (!db) return null;

  if (db.type === 'postgres') {
    const rows = await db.client`
      SELECT locations_json, students_json, payments_json, settings_json, updated_at
      FROM user_data
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0];
  } else {
    const res = await db.client.execute({
      sql: 'SELECT locations_json, students_json, payments_json, settings_json, updated_at FROM user_data WHERE user_id = ? LIMIT 1',
      args: [userId]
    });
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }
}

export async function saveUserData(userId, { locationsJson, studentsJson, paymentsJson, settingsJson = '', updatedAt }) {
  const db = getDatabase();
  if (!db) throw new Error('Database not configured');

  if (db.type === 'postgres') {
    await db.client`
      INSERT INTO user_data (user_id, locations_json, students_json, payments_json, settings_json, updated_at)
      VALUES (${userId}, ${locationsJson}, ${studentsJson}, ${paymentsJson}, ${settingsJson}, ${updatedAt})
      ON CONFLICT(user_id) DO UPDATE SET
        locations_json = EXCLUDED.locations_json,
        students_json = EXCLUDED.students_json,
        payments_json = EXCLUDED.payments_json,
        settings_json = EXCLUDED.settings_json,
        updated_at = EXCLUDED.updated_at
    `;
  } else {
    await db.client.execute({
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
      args: [userId, locationsJson, studentsJson, paymentsJson, settingsJson, updatedAt]
    });
  }
}

// Token and request helpers
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
