// src/features/auth/utils/authStore.ts
type StorageMode = "session" | "local";

const KEY = "spendsense.auth";
const MODE_KEY = "spendsense.auth.mode";

export type StoredAuth = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
};

function getStorage(): Storage {
  const mode = (localStorage.getItem(MODE_KEY) as StorageMode) ?? "session";
  return mode === "local" ? localStorage : sessionStorage;
}

export function setRememberMe(remember: boolean) {
  localStorage.setItem(MODE_KEY, remember ? "local" : "session");
}

export function saveAuth(t: {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  const s = getStorage();
  const expiresAt = Date.now() + (t.expiresIn ?? 3600) * 1000 - 30_000;
  const payload: StoredAuth = { ...t, expiresAt };
  s.setItem(KEY, JSON.stringify(payload));
  return payload;
}

export function getAuth(): StoredAuth | null {
  const s = getStorage();
  const raw = s.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    s.removeItem(KEY);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
