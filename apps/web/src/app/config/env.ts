type AppEnv = {
  apiBaseUrl: string;

  cognitoRegion: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;

  // Hosted UI base domain (no paths)
  // Example: https://spendsenseai.auth.ap-south-1.amazoncognito.com
  cognitoDomain: string;

  // SPA URLs
  cognitoRedirectUri: string; // http://localhost:5173/oauth/callback
  cognitoLogoutUri: string; // http://localhost:5173/login
};

const getValue = (value: string | undefined, fallback = ""): string =>
  value ?? fallback;

export const env: AppEnv = {
  apiBaseUrl: getValue(
    import.meta.env.VITE_API_BASE_URL,
    "http://localhost:8000",
  ),

  cognitoRegion: getValue(import.meta.env.VITE_COGNITO_REGION),
  cognitoUserPoolId: getValue(import.meta.env.VITE_COGNITO_USER_POOL_ID),
  cognitoClientId: getValue(import.meta.env.VITE_COGNITO_CLIENT_ID),

  cognitoDomain: getValue(import.meta.env.VITE_COGNITO_DOMAIN),

  cognitoRedirectUri: getValue(
    import.meta.env.VITE_COGNITO_REDIRECT_URI,
    `${window.location.origin}/oauth/callback`,
  ),
  cognitoLogoutUri: getValue(
    import.meta.env.VITE_COGNITO_LOGOUT_URI,
    `${window.location.origin}/login`,
  ),
};

export const hasCognitoConfig = Boolean(
  env.cognitoRegion && env.cognitoClientId && env.cognitoDomain,
);
