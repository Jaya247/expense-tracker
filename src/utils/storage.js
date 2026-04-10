// localStorage utility helpers

const STORAGE_KEYS = {
  EXPENSES: 'aiet_expenses',
  BUDGETS: 'aiet_budgets',
  CATEGORIES: 'aiet_categories',
  SETTINGS: 'aiet_settings',
};

export function loadState(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error loading state for ${key}:`, e);
    return null;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving state for ${key}:`, e);
  }
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

export function exportAllData() {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = loadState(key);
  });
  return data;
}

export function importData(data) {
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    if (data[name]) {
      saveState(key, data[name]);
    }
  });
}

export { STORAGE_KEYS };
