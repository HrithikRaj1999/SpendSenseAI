import * as React from "react";
import type { CategoryBudget } from "../../utils/types";
import { CategoryBudgetRow } from "./CategoryBudgetRow";

export function CategoryBudgetList({
  items,
  onEdit,
}: {
  items: CategoryBudget[];
  onEdit?: (item: CategoryBudget) => void;
}) {
  const sorted = React.useMemo(
    () => [...items].sort((a, b) => b.percentUsed - a.percentUsed),
    [items],
  );

  return (
    <div className="space-y-3">
      {sorted.map((c) => (
        <CategoryBudgetRow key={c.id} item={c} onEdit={onEdit} />
      ))}
    </div>
  );
}
