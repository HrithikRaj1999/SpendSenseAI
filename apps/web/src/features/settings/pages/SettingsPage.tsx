import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

export default function SettingsPage() {
  const { signOut, isSigningOut } = useSignOut();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account.</p>
      </div>

      <div className="rounded-2xl border p-4 space-y-3">
        <div className="text-sm font-medium">Account</div>

        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={signOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      </div>
    </div>
  );
}
