export const ROUTES = {
  SIGN_IN: "/auth/sign-in",
  CALLBACK: "/oauth/callback",

  // App
  APP: "/app",
  DASHBOARD: "/app/dashboard",
  EXPENSES: "/app/expenses",
  BUDGETS: "/app/budgets",
  TRANSACTIONS: "/app/transactions",

  // AI Hub
  AI: "/app/ai",
  AI_INSIGHTS: "/app/ai/insights",
  AI_ALERTS: "/app/ai/alerts",
  AI_ANALYTICS: "/app/ai/analytics",
  SETTINGS: "/app/settings",
} as const;
