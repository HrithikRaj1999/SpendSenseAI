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

type AuthUser = {
  email?: string;
  sub?: string;
};

type AuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch seconds
  user: AuthUser;
};

type AuthState = {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: "auth/start" }
  | { type: "auth/success"; payload: AuthSession }
  | { type: "auth/failure"; payload: string }
  | { type: "auth/signout" };

const STORAGE_KEY = "spendsense.auth.session.v1";

const initialState: AuthState = {
  session: null,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "auth/start":
      return { ...state, loading: true, error: null };
    case "auth/success":
      return { session: action.payload, loading: false, error: null };
    case "auth/failure":
      return { ...state, loading: false, error: action.payload };
    case "auth/signout":
      return { session: null, loading: false, error: null };
    default:
      return state;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function buildSession(tokens: {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn?: number;
}): AuthSession {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn =
    typeof tokens.expiresIn === "number" ? tokens.expiresIn : 3600;
  const expiresAt = now + expiresIn;

  const idPayload = decodeJwtPayload(tokens.idToken);
  return {
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
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

function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function isExpired(session: AuthSession): boolean {
  // small skew buffer
  const now = Math.floor(Date.now() / 1000);
  return session.expiresAt <= now + 30;
}

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  handleOAuthCallback: (code: string, state: string | null) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on boot
  useEffect(() => {
    const session = readSession();
    if (session && !isExpired(session)) {
      dispatch({ type: "auth/success", payload: session });
    } else if (session && isExpired(session)) {
      clearSession();
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      loading: state.loading,
      error: state.error,

      // Redirect to Cognito Hosted UI using PKCE
      signIn: async () => {
        dispatch({ type: "auth/start" });
        try {
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

      // Called by /oauth/callback page after Cognito redirects back
      handleOAuthCallback: async (code: string, stateValue: string | null) => {
        dispatch({ type: "auth/start" });
        try {
          const tokens = await exchangeCodeForTokens(code, stateValue);
          const session = buildSession(tokens);
          saveSession(session);
          dispatch({ type: "auth/success", payload: session });
        } catch (e) {
          dispatch({
            type: "auth/failure",
            payload: e instanceof Error ? e.message : "OAuth callback failed.",
          });
          throw e;
        }
      },

      signOut: () => {
        clearSession();
        dispatch({ type: "auth/signout" });

        // Hosted UI logout (ends Cognito session too)
        try {
          beginLogout();
        } catch {
          // if env missing, just stay signed out locally
          window.location.assign("/login");
        }
      },

      clearError: () => {
        if (state.error) dispatch({ type: "auth/failure", payload: "" });
      },
    }),
    [state.error, state.loading, state.session],
  );

  // quick guard: if env is missing, fail loud in dev
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
