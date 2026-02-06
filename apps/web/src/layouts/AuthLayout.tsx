import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">SpendSenseAI</h1>
          <p className="text-sm text-slate-500">
            Track expenses smarter with AI
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
