import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const { signIn, loading, error } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  return (
    /* h-dvh + overflow-hidden ensures it stays fixed in the center without scrolling */
    <div className="flex h-dvh w-full items-center justify-center bg-gray-50 overflow-hidden px-4">
      {/* Container constraints: 
        - max-w-sm for a tighter, more professional feel
        - animate-in for a smooth entrance
      */}
      <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 sm:p-10">
          {/* App Branding Area - Matches Sidebar Style */}
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-indigo-100 bg-white text-2xl font-bold shadow-sm ring-8 ring-indigo-50">
              S
            </div>

            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              SpendSenseAI
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              AI Finance Guru
            </p>
          </div>

          {/* Error Notification - Fixed height container to prevent layout jumping */}
          <div className="mt-6 min-h-[40px]">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-100 animate-in slide-in-from-top-2">
                <svg
                  className="h-5 w-5 shrink-0 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs font-medium text-red-800 leading-tight">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-center">
              <label className="group flex cursor-pointer items-center gap-3 text-sm select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-indigo-600 checked:bg-indigo-600"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <svg
                    className="absolute h-3.5 w-3.5 ml-0.5 hidden peer-checked:block text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-500 transition-colors group-hover:text-gray-900">
                  Keep me logged in
                </span>
              </label>
            </div>

            <button
              onClick={() => signIn(rememberMe)}
              disabled={loading}
              className={cn(
                "group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]",
                loading
                  ? "cursor-not-allowed opacity-80"
                  : "hover:bg-indigo-700 hover:shadow-indigo-200",
              )}
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Connecting Securely...</span>
                </>
              ) : (
                <>
                  <span>Continue to Dashboard</span>
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                Secured by AWS Cognito
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}
