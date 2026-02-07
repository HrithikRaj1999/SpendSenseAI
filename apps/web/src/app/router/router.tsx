import * as React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { RequireAuth, PublicOnly } from "@/app/router/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

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

const BudgetsPage = React.lazy(
  () => import("@/features/budgets/pages/BudgetsPage"),
);

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

function PageFallback() {
  return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <React.Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={ROUTES.SIGN_IN} replace />}
            />

            <Route
              path={ROUTES.SIGN_IN}
              element={
                <PublicOnly>
                  <AuthLayout>
                    <SignInPage />
                  </AuthLayout>
                </PublicOnly>
              }
            />

            <Route
              path={ROUTES.CALLBACK}
              element={
                <AuthLayout>
                  <OAuthCallbackPage />
                </AuthLayout>
              }
            />

            <Route
              path={ROUTES.APP}
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<DashboardPage />} />

              {/* ✅ EXPENSES HUB */}
              <Route path="expenses" element={<ExpensesLayoutPage />}>
                <Route index element={<AllExpensePage />} />
                <Route path="add" element={<AddExpensePage />} />
                <Route path="bulk" element={<BulkActionsPage />} />
                <Route path="cleanup" element={<CleanupPage />} />
                <Route path="recurring" element={<RecurringPage />} />
                <Route path="insights" element={<ExpenseInsightsPage />} />
                <Route path="ask-ai" element={<AskAiPage />} />
                <Route path="trash" element={<TrashPage />} />
              </Route>

              <Route path="budgets" element={<BudgetsPage />} />

              {/* AI */}
              <Route path="ai" element={<AiHubPage />}>
                <Route index element={<Navigate to="insights" replace />} />
                <Route path="insights" element={<AiInsightsPage />} />
                <Route path="alerts" element={<AiAlertsPage />} />
                <Route path="analytics" element={<AiAnalyticsPage />} />
              </Route>

              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to={ROUTES.SIGN_IN} replace />}
            />
          </Routes>
        </React.Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}
