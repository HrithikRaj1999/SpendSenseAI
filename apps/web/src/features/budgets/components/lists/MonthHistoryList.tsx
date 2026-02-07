import type { BudgetHistoryMonth } from "../../utils/types";
import { Sparkline } from "../ui/Sparkline";
import { cn } from "@/lib/utils";

export function MonthHistoryList({ items }: { items: BudgetHistoryMonth[] }) {
  const spark = items.map((m) => m.healthScore);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border p-3">
        <div>
          <div className="text-sm font-medium">Health trend</div>
          <div className="text-xs text-muted-foreground">Last {items.length} months</div>
        </div>
        <Sparkline points={spark} />
      </div>

      {items.map((m) => (
        <div key={m.month} className="flex items-center justify-between rounded-2xl border p-3">
          <div>
            <div className="text-sm font-medium">{m.month}</div>
            <div className="text-xs text-muted-foreground">
              Spent ₹{Math.round(m.totalSpent)} / ₹{Math.round(m.totalLimit)}
            </div>
          </div>
          <div className={cn("text-sm font-medium", m.overspent ? "text-destructive" : "text-emerald-600")}>
            {m.overspent ? "Overspent" : "On Track"} • {m.healthScore}
          </div>
        </div>
      ))}
    </div>
  );
}
