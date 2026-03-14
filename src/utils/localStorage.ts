const PREFIX = 'aws-sa-pro:';

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}
