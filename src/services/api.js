/**
 * Kargah Server API Client
 * Handles communication with Vercel Serverless Functions and Turso Database
 */

const BASE_URL = '';

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'خطا در ورود به حساب کاربری');
  }
  return data;
}

export async function registerUser({ username, password, fullName, email, initialData }) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, fullName, email, initialData })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'خطا در ثبت‌نام کاربر');
  }
  return data;
}

export async function getCurrentUser(token) {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('نشست کاربری نامعتبر است');
  }
  return res.json();
}

export async function fetchServerData(token) {
  const res = await fetch(`${BASE_URL}/api/data`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'خطا در دریافت اطلاعات از سرور');
  }
  return data;
}

export async function saveServerData(token, payload) {
  const res = await fetch(`${BASE_URL}/api/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'خطا در ذخیره اطلاعات روی سرور');
  }
  return data;
}

export async function checkServerStatus() {
  try {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (!res.ok) return { configured: false, status: 'error', message: 'سرور در دسترس نیست' };
    return await res.json();
  } catch (err) {
    return { configured: false, status: 'offline', message: 'عدم ارتباط با سرور' };
  }
}
