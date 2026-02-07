import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { WhatIfScenarioModal } from "../components/modals/WhatIfScenarioModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsWhatIfPage() {
  const { data } = useGetActiveBudgetQuery();
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <WhatIfScenarioModal />
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What-If Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>
            Build scenarios (change category limits, total limit, mode) and see projected runout date,
            health score changes, and risk categories.
          </div>
          <div className="rounded-2xl border p-3">
            This page is wired for the final experience; hook it to your backend simulation endpoint
            (<code>/budgets/what-if</code>) to generate a full predicted BudgetDTO.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
