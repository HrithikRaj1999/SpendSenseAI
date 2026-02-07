import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function SettingsPage() {
  const { signOut, isSigningOut } = useSignOut();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      <div className="rounded-2xl border p-4 space-y-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">Appearance</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="rounded-xl"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="rounded-xl"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="rounded-xl"
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="text-sm font-medium">Account</div>
          <Button
            variant="destructive"
            className="w-full rounded-xl sm:w-auto"
            onClick={signOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
