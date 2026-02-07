import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetHealthScore } from "../../utils/types";

export function BudgetHealthScoreCard({ health }: { health: BudgetHealthScore }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Budget Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-semibold">{health.score}</div>
          <div className="text-sm text-muted-foreground">{health.label}</div>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {health.reasons.slice(0, 3).map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
