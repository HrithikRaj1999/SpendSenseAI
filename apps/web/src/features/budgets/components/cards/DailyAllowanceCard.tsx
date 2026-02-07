import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetSummary } from "../../utils/types";
import { toINR } from "../../utils/budgetMath";

export function DailyAllowanceCard({ summary }: { summary: BudgetSummary }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily Safe Spend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-semibold">{toINR(summary.dailyAllowance)}</div>
        <div className="text-sm text-muted-foreground">
          Based on remaining budget and {summary.daysRemaining} days left.
        </div>
      </CardContent>
    </Card>
  );
}
