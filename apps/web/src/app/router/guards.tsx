import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/app/router/routes";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  if (loading) return null;
  if (!isAuthed) return <Navigate to={ROUTES.SIGN_IN} replace />;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  if (loading) return null;
  if (isAuthed) return <Navigate to={ROUTES.APP} replace />;
  return <>{children}</>;
}
