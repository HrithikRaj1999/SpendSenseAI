// src/features/auth/pages/OAuthCallbackPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/app/router/routes";

export default function OAuthCallbackPage() {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code) {
      navigate(ROUTES.SIGN_IN, { replace: true });
      return;
    }

    (async () => {
      await handleOAuthCallback(code, state);

      // remove code/state so refresh doesn't reuse it
      window.history.replaceState({}, document.title, ROUTES.APP);

      navigate(ROUTES.APP, { replace: true });
    })().catch(() => {
      navigate(ROUTES.SIGN_IN, { replace: true });
    });
  }, [handleOAuthCallback, navigate]);

  return <div className="p-6">Signing you in...</div>;
}
