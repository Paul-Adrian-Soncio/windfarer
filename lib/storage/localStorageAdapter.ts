/**
 * Thin wrapper around window.localStorage. This is the ONLY module that is
 * allowed to touch `window.localStorage` directly — everything else (store,
 * repository) goes through here. When WindFarer moves to a real backend,
 * this file (or its callers in lib/repository) is the seam to replace.
 */
export const localStorageAdapter = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};
