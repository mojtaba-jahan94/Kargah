import { initialLocations, initialStudents, initialPayments } from './initialData';

const STORAGE_KEYS = {
  LOCATIONS: 'kargah_locations_v1',
  STUDENTS: 'kargah_students_v1',
  PAYMENTS: 'kargah_payments_v1',
  SETTINGS: 'kargah_settings_v1',
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
