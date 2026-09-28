import { initialLocations, initialStudents, initialPayments } from './initialData';

export const STORAGE_KEYS = {
  LOCATIONS: 'kargah_locations_v1',
  STUDENTS: 'kargah_students_v1',
  PAYMENTS: 'kargah_payments_v1',
  SETTINGS: 'kargah_settings_v1',
  AUTH_TOKEN: 'kargah_auth_token_v1',
  AUTH_USER: 'kargah_auth_user_v1',
  STORAGE_MODE: 'kargah_storage_mode_v1', // 'local' | 'server'
  LAST_SYNC: 'kargah_last_sync_v1',
};

export function loadStoredData() {
  try {
    const storedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);

    return {
      locations: storedLocations ? JSON.parse(storedLocations) : initialLocations,
      students: storedStudents ? JSON.parse(storedStudents) : initialStudents,
      payments: storedPayments ? JSON.parse(storedPayments) : initialPayments,
    };
  } catch (err) {
    console.error('Error loading data from localStorage, fallback to initial data', err);
    return {
      locations: initialLocations,
      students: initialStudents,
      payments: initialPayments,
    };
  }
}

export function saveLocationsToStorage(locations) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  } catch (err) {
    console.error('Failed to save locations', err);
  }
}

export function saveStudentsToStorage(students) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students', err);
  }
}

export function savePaymentsToStorage(payments) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payments', err);
  }
}

export function saveAllDataToStorage({ locations, students, payments }) {
  if (locations) saveLocationsToStorage(locations);
  if (students) saveStudentsToStorage(students);
  if (payments) savePaymentsToStorage(payments);
}

// Storage Mode: 'local' (Browser) or 'server' (Cloud / Turso)
export function getSavedStorageMode() {
  try {
    return localStorage.getItem(STORAGE_KEYS.STORAGE_MODE) || 'local';
  } catch (err) {
    return 'local';
  }
}

export function setSavedStorageMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, mode);
  } catch (err) {
    console.error('Failed to set storage mode', err);
  }
}

// Auth Session helpers
export function getStoredAuthSession() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return {
      token: token || null,
      user: userStr ? JSON.parse(userStr) : null,
    };
  } catch (err) {
    return { token: null, user: null };
  }
}

export function saveStoredAuthSession(token, user) {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    else localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    if (user) localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  } catch (err) {
    console.error('Failed to save auth session', err);
  }
}

export function clearStoredAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  } catch (err) {
    console.error('Failed to clear auth session', err);
  }
}

export function getLastSyncTime() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (err) {
    return null;
  }
}

export function setLastSyncTime(isoDateStr) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, isoDateStr || new Date().toISOString());
  } catch (err) {
    console.error('Failed to save last sync time', err);
  }
}

export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  return {
    locations: initialLocations,
    students: initialStudents,
    payments: initialPayments,
  };
}

export function exportBackupJSON(locations, students, payments) {
  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    locations,
    students,
    payments,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `kargah-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
