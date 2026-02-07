import { Outlet } from "react-router-dom";
import { BudgetsSubnav } from "../components/nav/BudgetsSubnav";
import { BudgetMonthPicker } from "../components/nav/BudgetMonthPicker";
import { CreateFirstBudgetModal } from "../components/modals/CreateFirstBudgetModal";
import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BudgetsLayout() {
  const { data, isLoading } = useGetActiveBudgetQuery();
  const hasBudget = !!data?.budget;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Limits, alerts, AI forecasts, and what-if simulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BudgetMonthPicker />
          <CreateFirstBudgetModal
            trigger={
              <Button className="rounded-2xl" disabled={isLoading}>
                {hasBudget ? "New Month Budget" : "Create First Budget"}
              </Button>
            }
          />
        </div>
      </div>

      <BudgetsSubnav />

      {!hasBudget ? (
        <Card className="rounded-3xl">
          <CardContent className="p-6 space-y-3">
            <div className="text-lg font-semibold">No budget set yet</div>
            <p className="text-sm text-muted-foreground">
              Create a budget to unlock category limits, alerts, burn-rate
              forecasts, AI suggestions, and simulations.
            </p>
            <div className="flex gap-2">
              <CreateFirstBudgetModal
                trigger={<Button className="rounded-2xl">Create Budget</Button>}
              />
              <Button variant="outline" className="rounded-2xl">
                Use Smart Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
