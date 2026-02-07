import * as React from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import { ROUTES } from "@/app/router/routes";
import { RequireAuth, PublicOnly } from "@/app/router/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

// -------------------- lazy pages --------------------
const SignInPage = React.lazy(() => import("@/features/auth/pages/SignInPage"));
const OAuthCallbackPage = React.lazy(
  () => import("@/features/auth/pages/OAuthCallbackPage"),
);

const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);

const ExpensesLayoutPage = React.lazy(
  () => import("@/features/expenses/pages/ExpenseLayoutPage"),
);
const AllExpensePage = React.lazy(
  () => import("@/features/expenses/pages/AllExpensePage"),
);
const AddExpensePage = React.lazy(
  () => import("@/features/expenses/pages/AddExpensePage"),
);
const BulkActionsPage = React.lazy(
  () => import("@/features/expenses/pages/BulkActionsPage"),
);
const CleanupPage = React.lazy(
  () => import("@/features/expenses/pages/CleanupPage"),
);
const RecurringPage = React.lazy(
  () => import("@/features/expenses/pages/RecurringPage"),
);
const ExpenseInsightsPage = React.lazy(
  () => import("@/features/expenses/pages/ExpenseInsightsPage"),
);
const AskAiPage = React.lazy(
  () => import("@/features/expenses/pages/AskAipage"),
);
const TrashPage = React.lazy(
  () => import("@/features/expenses/pages/TrashPage"),
);

// Budgets (named exports wrapped as default for React.lazy)
const BudgetsLayout = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsLayout").then((m) => ({
    default: m.BudgetsLayout,
  })),
);
const BudgetsOverviewPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsOverviewPage").then((m) => ({
    default: m.BudgetsOverviewPage,
  })),
);
const BudgetsCategoriesPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsCategoriesPage").then((m) => ({
    default: m.BudgetsCategoriesPage,
  })),
);
const BudgetsAlertsPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsAlertsPage").then((m) => ({
    default: m.BudgetsAlertsPage,
  })),
);
const BudgetsGuardrailsPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsGuardrailsPage").then((m) => ({
    default: m.BudgetsGuardrailsPage,
  })),
);
const BudgetsGoalsPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsGoalsPage").then((m) => ({
    default: m.BudgetsGoalsPage,
  })),
);
const BudgetsInsightsPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsInsightsPage").then((m) => ({
    default: m.BudgetsInsightsPage,
  })),
);
const BudgetsWhatIfPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsWhatIfPage").then((m) => ({
    default: m.BudgetsWhatIfPage,
  })),
);
const BudgetsHistoryPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsHistoryPage").then((m) => ({
    default: m.BudgetsHistoryPage,
  })),
);
const BudgetsSettingsPage = React.lazy(() =>
  import("@/features/budgets/routes/BudgetsSettingsPage").then((m) => ({
    default: m.BudgetsSettingsPage,
  })),
);

// AI
const AiHubPage = React.lazy(() => import("@/features/Ai/pages/AiHubPage"));
const AiInsightsPage = React.lazy(
  () => import("@/features/Ai/pages/AiInsightPage"),
);
const AiAlertsPage = React.lazy(
  () => import("@/features/Ai/pages/AiAlertsPage"),
);
const AiAnalyticsPage = React.lazy(
  () => import("@/features/Ai/pages/AiAnalyticsPage"),
);

const SettingsPage = React.lazy(
  () => import("@/features/settings/pages/SettingsPage"),
);

// -------------------- fallback --------------------
import { MoneyLoader } from "@/components/ui/MoneyLoader";

function PageFallback() {
  return <MoneyLoader />;
}

// Wrap route element with Suspense fallback (clean + reusable)
function withSuspense(node: React.ReactNode) {
  return <React.Suspense fallback={<PageFallback />}>{node}</React.Suspense>;
}

// -------------------- router (latest) --------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={ROUTES.SIGN_IN} replace />,
  },

  {
    path: ROUTES.SIGN_IN,
    element: withSuspense(
      <PublicOnly>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </PublicOnly>,
    ),
  },

  {
    path: ROUTES.CALLBACK,
    element: withSuspense(
      <AuthLayout>
        <OAuthCallbackPage />
      </AuthLayout>,
    ),
  },

  {
    path: ROUTES.APP, // "/app"
    element: withSuspense(
      <RequireAuth>
        <AppShell />
      </RequireAuth>,
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "dashboard", element: withSuspense(<DashboardPage />) },

      // EXPENSES
      {
        path: "expenses",
        element: withSuspense(<ExpensesLayoutPage />),
        children: [
          { index: true, element: withSuspense(<AllExpensePage />) },
          { path: "add", element: withSuspense(<AddExpensePage />) },
          { path: "bulk", element: withSuspense(<BulkActionsPage />) },
          { path: "cleanup", element: withSuspense(<CleanupPage />) },
          { path: "recurring", element: withSuspense(<RecurringPage />) },
          { path: "insights", element: withSuspense(<ExpenseInsightsPage />) },
          { path: "ask-ai", element: withSuspense(<AskAiPage />) },
          { path: "trash", element: withSuspense(<TrashPage />) },
        ],
      },

      {
        path: "budgets",
        element: withSuspense(<BudgetsLayout />),
        children: [
          { index: true, element: withSuspense(<BudgetsOverviewPage />) },
          {
            path: "categories",
            element: withSuspense(<BudgetsCategoriesPage />),
          },
          { path: "alerts", element: withSuspense(<BudgetsAlertsPage />) },
          {
            path: "guardrails",
            element: withSuspense(<BudgetsGuardrailsPage />),
          },
          { path: "goals", element: withSuspense(<BudgetsGoalsPage />) },
          { path: "insights", element: withSuspense(<BudgetsInsightsPage />) },
          { path: "what-if", element: withSuspense(<BudgetsWhatIfPage />) },
          { path: "history", element: withSuspense(<BudgetsHistoryPage />) },
          { path: "settings", element: withSuspense(<BudgetsSettingsPage />) },
        ],
      },

      // AI
      {
        path: "ai",
        element: withSuspense(<AiHubPage />),
        children: [
          { index: true, element: <Navigate to="insights" replace /> },
          { path: "insights", element: withSuspense(<AiInsightsPage />) },
          { path: "alerts", element: withSuspense(<AiAlertsPage />) },
          { path: "analytics", element: withSuspense(<AiAnalyticsPage />) },
        ],
      },

      { path: "settings", element: withSuspense(<SettingsPage />) },
    ],
  },

  {
    path: "*",
    element: <Navigate to={ROUTES.SIGN_IN} replace />,
  },
]);

// -------------------- exported component --------------------
export function AppRouter() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
