export const ROUTES = {
  SIGN_IN: "/auth/sign-in",
  CALLBACK: "/oauth/callback",

  APP: "/app",

  DASHBOARD: "/app/dashboard",
  // Expenses Hub
  EXPENSES: "/app/expenses",
  EXPENSES_ADD: "/app/expenses/add",
  EXPENSES_BULK: "/app/expenses/bulk",
  EXPENSES_CLEANUP: "/app/expenses/cleanup",
  EXPENSES_RECURRING: "/app/expenses/recurring",
  EXPENSES_INSIGHTS: "/app/expenses/insights",
  EXPENSES_ASK_AI: "/app/expenses/ask-ai",
  EXPENSES_TRASH: "/app/expenses/trash",

  BUDGETS: "/app/budgets",

  AI: "/app/ai",
  AI_INSIGHTS: "/app/ai/insights",
  AI_ALERTS: "/app/ai/alerts",
  AI_ANALYTICS: "/app/ai/analytics",

  SETTINGS: "/app/settings",
} as const;
