import { env } from "@/app/config/env";
import { randomString, sha256Base64Url } from "@/features/auth/utils/pkce";

const STORAGE = {
  verifier: "spendsense.pkce.verifier",
  state: "spendsense.pkce.state",
} as const;

export const beginPkceSignIn = async () => {
  const codeVerifier = randomString(96);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state = randomString(24);

  sessionStorage.setItem(STORAGE.verifier, codeVerifier);
  sessionStorage.setItem(STORAGE.state, state);

  const params = new URLSearchParams({
    client_id: env.cognitoClientId,
    response_type: "code",
    redirect_uri: env.cognitoRedirectUri,
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  const url = `${env.cognitoDomain}/oauth2/authorize?${params.toString()}`;
  console.log("AUTH URL =>", url);
  window.location.assign(url);
};

export const exchangeCodeForTokens = async (
  code: string,
  returnedState: string | null,
) => {
  const expectedState = sessionStorage.getItem(STORAGE.state);
  const codeVerifier = sessionStorage.getItem(STORAGE.verifier);

  if (!codeVerifier)
    throw new Error("Missing PKCE verifier. Please try signing in again.");
  if (!returnedState || !expectedState || returnedState !== expectedState) {
    throw new Error("Invalid OAuth state. Please try signing in again.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.cognitoClientId,
    code,
    redirect_uri: env.cognitoRedirectUri,
    code_verifier: codeVerifier,
  });
  console.log("TOKEN BODY =>", {
    grant_type: "authorization_code",
    client_id: env.cognitoClientId,
    code,
    redirect_uri: env.cognitoRedirectUri,
    code_verifier: codeVerifier,
  });
  try {
    const res = await fetch(`${env.cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = (await res.json()) as any;

    if (!res.ok) {
      const msg =
        typeof data?.error_description === "string"
          ? data.error_description
          : "Token exchange failed.";
      throw new Error(msg);
    }

    return {
      accessToken: data.access_token as string,
      idToken: data.id_token as string,
      refreshToken: data.refresh_token as string | undefined,
      expiresIn: data.expires_in as number | undefined,
    };
  } finally {
    sessionStorage.removeItem(STORAGE.verifier);
    sessionStorage.removeItem(STORAGE.state);
  }
};

export const beginLogout = () => {
  const params = new URLSearchParams({
    client_id: env.cognitoClientId,
    logout_uri: env.cognitoLogoutUri,
  });
  window.location.assign(`${env.cognitoDomain}/logout?${params.toString()}`);
};
