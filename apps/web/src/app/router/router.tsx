import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { RequireAuth, PublicOnly } from "@/app/router/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import SignInPage from "@/features/auth/pages/SignInPage";
import OAuthCallbackPage from "@/features/auth/pages/OAuthCallbackPage";

const Dashboard = () => (
  <div className="rounded-xl border bg-white p-6">Dashboard</div>
);

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

        <Route
          path={ROUTES.APP}
          element={
            <RequireAuth>
              <AppShell>
                <Dashboard />
              </AppShell>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.SIGN_IN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
