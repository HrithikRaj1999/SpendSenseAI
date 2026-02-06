import React from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, booting } = useAuth();

  if (booting) return null; // or loader
  if (!session?.accessToken) return <Navigate to={ROUTES.SIGN_IN} replace />;

  return <>{children}</>;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, booting } = useAuth();

  if (booting) return null;
  if (session?.accessToken) return <Navigate to={ROUTES.APP} replace />;

  return <>{children}</>;
}
