import { useEffect } from "react";

export function snapshotKey(kind: string, id: string | undefined) {
  return `brainworks:admin:snapshot:${kind}:${id ?? "new"}`;
}

export function saveSnapshot(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function takeSnapshot<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useSessionSnapshot<T>(key: string, restore: (value: T) => void) {
  useEffect(() => {
    const value = takeSnapshot<T>(key);
    if (value) restore(value);
  }, [key, restore]);
}
