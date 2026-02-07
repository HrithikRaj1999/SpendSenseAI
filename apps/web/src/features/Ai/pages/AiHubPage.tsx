import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/app/router/routes";

const tabs = [
  { label: "Insights", to: ROUTES.AI_INSIGHTS },
  { label: "Alerts", to: ROUTES.AI_ALERTS },
  { label: "Analytics", to: ROUTES.AI_ANALYTICS },
] as const;

export default function AiHubPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          AI Financial Advisor
        </h1>
        <p className="text-sm text-muted-foreground">
          Daily savings tips, smart alerts, and deep spending insights.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap rounded-xl border px-3 py-2 text-sm hover:bg-muted",
                isActive && "bg-muted font-medium",
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
