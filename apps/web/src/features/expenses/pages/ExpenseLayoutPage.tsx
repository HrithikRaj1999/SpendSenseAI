import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/app/router/routes";
import {
  ArrowLeft,
  List,
  PlusCircle,
  Trash2,
  Sparkles,
  Repeat,
  BriefcaseConveyorBelt,
  Layers,
  BarChart3,
} from "lucide-react";

const items = [
  { to: ROUTES.EXPENSES, label: "All Expenses", icon: List },
  { to: ROUTES.EXPENSES_ADD, label: "Add Expense", icon: PlusCircle },
  { to: ROUTES.EXPENSES_BULK, label: "Bulk Actions", icon: Layers },
  {
    to: ROUTES.EXPENSES_CLEANUP,
    label: "Cleanup",
    icon: BriefcaseConveyorBelt,
  },
  { to: ROUTES.EXPENSES_RECURRING, label: "Recurring", icon: Repeat },
  { to: ROUTES.EXPENSES_INSIGHTS, label: "Insights", icon: BarChart3 },
  { to: ROUTES.EXPENSES_ASK_AI, label: "Ask AI", icon: Sparkles },
  { to: ROUTES.EXPENSES_TRASH, label: "Trash", icon: Trash2 },
];

export default function ExpensesLayoutPage() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => nav(ROUTES.DASHBOARD)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Expenses
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage, cleanup, detect recurring spends, and ask AI.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Pills */}
      <div className="w-full overflow-x-auto rounded-3xl bg-muted/30 ring-1 ring-border px-2 py-2 scrollbar-none sm:scrollbar-thin">
        <div className="flex w-max items-center gap-2">
          {items.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;

            return (
              <NavLink key={it.to} to={it.to} end={it.to === ROUTES.EXPENSES}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/60 text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Child pages render here */}
      <Outlet />
    </div>
  );
}
