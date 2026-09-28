/**
 * Kargah End-to-End Encryption (E2EE) Engine
 * Provides Zero-Knowledge Client-Side AES-256-GCM Encryption with PBKDF2 key derivation.
 * The server never sees plaintext names, student records, phone numbers, or financial transactions.
 */

const E2EE_PREFIX = '__E2EE_V1__:';
const PBKDF2_ITERATIONS = 100000;

// Convert Uint8Array to Base64
function uint8ToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from a passphrase and salt
 */
async function deriveEncryptionKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an object or string with AES-256-GCM
 * Output format: __E2EE_V1__:<base64(salt[16] + iv[12] + ciphertext)>
 */
export async function encryptData(data, passphrase) {
  if (!passphrase) {
    // If no passphrase is provided, return stringified data as fallback
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  try {
    const enc = new TextEncoder();
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const plaintextBytes = enc.encode(jsonString);

    // 16 bytes salt for PBKDF2, 12 bytes IV for AES-GCM
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveEncryptionKey(passphrase, salt);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintextBytes
    );

    const ciphertextBytes = new Uint8Array(ciphertextBuffer);

    // Combine: salt (16) + iv (12) + ciphertext (N)
    const combined = new Uint8Array(salt.length + iv.length + ciphertextBytes.length);
    combined.set(salt, 0);
    combined.set(iv, 16);
    combined.set(ciphertextBytes, 28);

    return E2EE_PREFIX + uint8ToBase64(combined);
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('خطا در فرآیند رمزنگاری اطلاعات: ' + err.message);
  }
}

/**
 * Decrypts an encrypted payload with AES-256-GCM
 * Returns parsed JSON or original data if not encrypted
 */
export async function decryptData(payload, passphrase) {
  if (!payload) return payload;

  // If payload is already a parsed object/array, return as-is
  if (typeof payload !== 'string') return payload;

  // Check if string is encrypted with our E2EE engine
  if (!payload.startsWith(E2EE_PREFIX)) {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  if (!passphrase) {
    throw new Error('رمز عبور برای رمزگشایی اطلاعات موجود نیست.');
  }

  try {
    const rawB64 = payload.substring(E2EE_PREFIX.length);
    const combined = base64ToUint8(rawB64);

    if (combined.length < 28) {
      throw new Error('قالب رمزنگاری نامعتبر است.');
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveEncryptionKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Decryption error:', err);
    throw new Error('رمزگشایی اطلاعات با شکست مواجه شد. رمز عبور نامعتبر است یا اطلاعات دستکاری شده است.');
  }
}

export function isEncrypted(val) {
  return typeof val === 'string' && val.startsWith(E2EE_PREFIX);
}
