import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress } from "../ui/BudgetProgress";
import type { BudgetSummary } from "../../utils/types";
import { toINR } from "../../utils/budgetMath";

export function BudgetSummaryCard({ summary }: { summary: BudgetSummary }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="text-lg font-semibold">{toINR(summary.totalLimit)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Spent</div>
            <div className="text-lg font-semibold">{toINR(summary.totalSpent)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Remaining</div>
            <div className="text-lg font-semibold">{toINR(summary.remaining)}</div>
          </div>
        </div>

        <BudgetProgress value={summary.percentUsed} />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{summary.daysRemaining} days remaining</span>
          <span>{toINR(summary.dailyAllowance)}/day safe spend</span>
        </div>
      </CardContent>
    </Card>
  );
}
