import React from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { signOut, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-lg font-semibold">SpendSenseAI</div>
          <button
            disabled={loading}
            onClick={() => void signOut()}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
