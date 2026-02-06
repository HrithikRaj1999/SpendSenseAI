import { useCallback, useState } from "react";
import { clearAuth } from "@/features/auth/utils/authStore";
import { beginLogout } from "../api/oauth";

export function useSignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(() => {
    setIsSigningOut(true);

    // 1) Clear app session (both local + session)
    clearAuth();

    // 2) Redirect to Cognito logout (ends hosted UI session)
    beginLogout();
  }, []);

  return { signOut, isSigningOut };
}
