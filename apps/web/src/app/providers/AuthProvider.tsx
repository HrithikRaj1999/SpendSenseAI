// src/app/providers/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { env } from "@/app/config/env";
import {
  beginPkceSignIn,
  beginLogout,
  exchangeCodeForTokens,
} from "@/features/auth/api/oauth";
import {
  setRememberMe,
  saveAuth,
  getAuth,
  clearAuth,
} from "@/features/auth/utils/authStore";

type AuthUser = {
  email?: string;
  sub?: string;
};

type AuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
  user: AuthUser;
};

type AuthState = {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  booting: boolean;
};

type AuthAction =
  | { type: "auth/start" }
  | { type: "auth/success"; payload: AuthSession }
  | { type: "auth/failure"; payload: string }
  | { type: "auth/signout" }
  | { type: "auth/booted" };

const initialState: AuthState = {
  session: null,
  loading: false,
  error: null,
  booting: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "auth/start":
      return { ...state, loading: true, error: null };
    case "auth/success":
      return {
        session: action.payload,
        loading: false,
        error: null,
        booting: false,
      };
    case "auth/failure":
      return { ...state, loading: false, error: action.payload };
    case "auth/signout":
      return { session: null, loading: false, error: null, booting: false };
    case "auth/booted":
      return { ...state, booting: false };
    default:
      return state;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    // base64url -> base64
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toSessionFromStored(stored: {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
}): AuthSession {
  const idPayload = decodeJwtPayload(stored.idToken);

  return {
    accessToken: stored.accessToken,
    idToken: stored.idToken,
    refreshToken: stored.refreshToken,
    expiresAt: stored.expiresAt,
    user: {
      email:
        typeof idPayload?.email === "string"
          ? (idPayload.email as string)
          : undefined,
      sub:
        typeof idPayload?.sub === "string"
          ? (idPayload.sub as string)
          : undefined,
    },
  };
}
function normalizeExpiresAt(expiresAt: number): number {
  // If it looks like seconds (10 digits), convert to ms
  return expiresAt < 1e12 ? expiresAt * 1000 : expiresAt;
}

function isExpired(expiresAt: number): boolean {
  const ms = normalizeExpiresAt(expiresAt);
  return ms <= Date.now() + 30_000;
}

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  booting: boolean;
  signIn: (rememberMe: boolean) => Promise<void>;
  handleOAuthCallback: (code: string, state: string | null) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Restore session on boot (from localStorage OR sessionStorage based on spendsense.auth.mode)
  useEffect(() => {
    const stored = getAuth();

    if (!stored) {
      dispatch({ type: "auth/booted" });
      return;
    }

    if (isExpired(stored.expiresAt)) {
      clearAuth();
      dispatch({ type: "auth/booted" });
      return;
    }

    dispatch({ type: "auth/success", payload: toSessionFromStored(stored) });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      loading: state.loading,
      error: state.error,
      booting: state.booting,

      // ✅ Redirect to Cognito Hosted UI using PKCE
      signIn: async (rememberMe: boolean) => {
        dispatch({ type: "auth/start" });
        try {
          // This decides localStorage vs sessionStorage for the coming login
          setRememberMe(rememberMe);

          await beginPkceSignIn();
          // navigation happens inside beginPkceSignIn()
        } catch (e) {
          dispatch({
            type: "auth/failure",
            payload: e instanceof Error ? e.message : "Sign in failed.",
          });
          throw e;
        }
      },

      // ✅ Called by /oauth/callback page after Cognito redirects back
      handleOAuthCallback: async (code: string, stateValue: string | null) => {
        dispatch({ type: "auth/start" });
        try {
          const tokens = await exchangeCodeForTokens(code, stateValue);

          // ✅ Persist to chosen storage key: "spendsense.auth"
          saveAuth(tokens);

          // ✅ Build in-memory session for UI
          const stored = getAuth();
          if (!stored) throw new Error("Failed to persist auth session.");

          dispatch({
            type: "auth/success",
            payload: toSessionFromStored(stored),
          });
        } catch (e) {
          dispatch({
            type: "auth/failure",
            payload: e instanceof Error ? e.message : "OAuth callback failed.",
          });
          throw e;
        }
      },

      signOut: () => {
        clearAuth();
        dispatch({ type: "auth/signout" });

        try {
          beginLogout();
        } catch {
          window.location.assign("/login");
        }
      },

      clearError: () => {
        if (state.error) dispatch({ type: "auth/failure", payload: "" });
      },
    }),
    [state.booting, state.error, state.loading, state.session],
  );

  // dev sanity checks
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (
        !env.cognitoClientId ||
        !env.cognitoDomain ||
        !env.cognitoRedirectUri
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          "[AuthProvider] Missing Cognito env config. Check apps/web/.env",
        );
      }
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
