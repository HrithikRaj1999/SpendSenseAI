import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function SignInPage() {
  const { signIn, loading, error } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Sign in</h2>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Keep me logged in
      </label>

      <button
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
        disabled={loading}
        onClick={() => signIn(rememberMe)}
      >
        {loading ? "Redirecting..." : "Continue to Login"}
      </button>
    </div>
  );
}
