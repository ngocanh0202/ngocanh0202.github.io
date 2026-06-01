import '@testing-library/jest-dom/vitest';

if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map();

  globalThis.localStorage = {
    clear() {
      storage.clear();
    },
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    key(index) {
      return Array.from(storage.keys())[index] ?? null;
    },
    removeItem(key) {
      storage.delete(key);
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    get length() {
      return storage.size;
    },
  };
}
