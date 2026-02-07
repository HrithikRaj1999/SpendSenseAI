import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { RequireAuth, PublicOnly } from "@/app/router/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";

import SignInPage from "@/features/auth/pages/SignInPage";
import OAuthCallbackPage from "@/features/auth/pages/OAuthCallbackPage";
import TransactionsPage from "@/features/expenses/pages/TransactionsPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ExpensesPage from "@/features/expenses/pages/ExpensesPage";
import BudgetsPage from "@/features/budgets/pages/BudgetsPage";
import AiHubPage from "@/features/Ai/pages/AiHubPage";
import AiInsightsPage from "@/features/Ai/pages/AiInsightPage";
import AiAlertsPage from "@/features/Ai/pages/AiAlertsPage";
import AiAnalyticsPage from "@/features/Ai/pages/AiAnalyticsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.SIGN_IN} replace />} />

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

        {/* APP SHELL */}
        <Route
          path={ROUTES.APP}
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budgets" element={<BudgetsPage />} />

          {/* AI */}
          <Route path="ai" element={<AiHubPage />}>
            <Route
              index
              element={<Navigate to={ROUTES.AI_INSIGHTS} replace />}
            />
            <Route path="insights" element={<AiInsightsPage />} />
            <Route path="alerts" element={<AiAlertsPage />} />
            <Route path="analytics" element={<AiAnalyticsPage />} />
          </Route>

          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.SIGN_IN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
