import { Button } from "@/components/ui/button";
import type { Goal } from "../../utils/types";
import { toINR } from "../../utils/budgetMath";

export function GoalsList({ items }: { items: Goal[] }) {
  return (
    <div className="space-y-2">
      {items.map((g) => {
        const pct = g.targetAmount ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
        return (
          <div key={g.id} className="rounded-2xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-muted-foreground">
                  {toINR(g.currentAmount)} / {toINR(g.targetAmount)} • {pct}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Auto-allocate unused: {g.autoAllocateUnused ? "On" : "Off"}
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl">
                Manage
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
