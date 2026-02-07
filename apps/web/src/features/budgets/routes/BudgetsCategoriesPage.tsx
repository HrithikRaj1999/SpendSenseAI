import * as React from "react";
import { useGetActiveBudgetQuery, useUpsertCategoryBudgetMutation } from "../api/budgetsApi";
import { CategoryBudgetList } from "../components/lists/CategoryBudgetList";
import { EditCategoryBudgetModal } from "../components/modals/EditCategoryBudgetModal";
import type { CategoryBudget } from "../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsCategoriesPage() {
  const { data } = useGetActiveBudgetQuery();
  const [upsert] = useUpsertCategoryBudgetMutation();

  const [editing, setEditing] = React.useState<CategoryBudget | null>(null);
  const [open, setOpen] = React.useState(false);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category Budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CategoryBudgetList
            items={data.categories}
            onEdit={(item) => {
              setEditing(item);
              setOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <EditCategoryBudgetModal
        open={open}
        onOpenChange={setOpen}
        item={editing}
        onSave={async (limit) => {
          if (!editing) return;
          await upsert({
            month: editing.month,
            category: editing.category,
            limit,
          });
        }}
      />
    </div>
  );
}
