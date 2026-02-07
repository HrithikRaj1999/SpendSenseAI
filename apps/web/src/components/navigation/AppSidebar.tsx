import * as React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "./nav.config";

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "h-dvh border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40",
        "sticky top-0",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <div
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center w-full",
            )}
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl border font-semibold">
              S
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">SpendSenseAI</div>
                <div className="text-xs text-muted-foreground">
                  AI Finance Guru
                </div>
              </div>
            )}
          </div>

          <button
            className={cn(
              "rounded-lg border px-2 py-1 text-xs hover:bg-muted",
              collapsed && "hidden",
            )}
            onClick={() => setCollapsed(true)}
          >
            Collapse
          </button>
        </div>

        {/* When collapsed show expand button */}
        {collapsed && (
          <div className="px-2 pb-2">
            <button
              className="w-full rounded-lg border px-2 py-2 text-xs hover:bg-muted"
              onClick={() => setCollapsed(false)}
              title="Expand"
            >
              →
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-2">
          {navItems.map(({ label, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  "hover:bg-muted",
                  isActive && "bg-muted font-medium",
                  collapsed && "justify-center px-2",
                )
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3">
          <div className={cn("rounded-xl border p-3", collapsed && "hidden")}>
            <div className="text-xs font-medium">Tip</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Check{" "}
              <span className="font-medium text-foreground">AI Advisor</span>{" "}
              daily for savings ideas.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
