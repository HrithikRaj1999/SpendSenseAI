import { useEffect, useRef } from "react";

import { exchangeCodeForTokens } from "../api/oauth";

export default function OAuthCallbackPage() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code) return;

    (async () => {
      const tokens = await exchangeCodeForTokens(code, state);
      window.history.replaceState({}, document.title, "/");

      // TODO: sav to storage/state
      console.log(tokens);
    })().catch((e) => {
      console.error(e);
    });
  }, []);

  return null;
}
