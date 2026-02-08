import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app/budgets", label: "Overview" },
  { to: "/app/budgets/categories", label: "Categories" },
  { to: "/app/budgets/alerts", label: "Alerts" },
  { to: "/app/budgets/guardrails", label: "Guardrails" },
  { to: "/app/budgets/goals", label: "Goals" },
  { to: "/app/budgets/insights", label: "AI Insights" },
  { to: "/app/budgets/what-if", label: "What-If" },
  { to: "/app/budgets/history", label: "History" },
  { to: "/app/budgets/settings", label: "Settings" },
];

export function BudgetsSubnav() {
  const loc = useLocation();

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none sm:scrollbar-thin">
      <div className="flex w-max items-center gap-2">
        {tabs.map((t) => {
          const active = loc.pathname === t.to;

          return (
            <NavLink
              key={t.to}
              to={{ pathname: t.to, search: loc.search }}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-medium ring-1 ring-black/5 transition whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
