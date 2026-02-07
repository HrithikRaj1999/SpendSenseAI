import { Button } from "@/components/ui/button";
import type { CategoryBudget } from "../../utils/types";
import { BudgetProgress } from "../ui/BudgetProgress";
import { SeverityPill } from "../ui/SeverityPill";
import { toINR } from "../../utils/budgetMath";

export function CategoryBudgetRow({
  item,
  onEdit,
}: {
  item: CategoryBudget;
  onEdit?: (item: CategoryBudget) => void;
}) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium">{item.category}</div>
              <SeverityPill severity={item.severity} />
            </div>
            <div className="text-sm text-muted-foreground">
              {toINR(item.spent)} / {toINR(item.limit)}
            </div>
          </div>
          <BudgetProgress value={item.percentUsed} />
          <div className="text-xs text-muted-foreground">
            Remaining: <span className="font-medium">{toINR(item.remaining)}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onEdit?.(item)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
