import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { GoalsList } from "../components/lists/GoalsList";
import { CreateGoalModal } from "../components/modals/CreateGoalModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsGoalsPage() {
  const { data } = useGetActiveBudgetQuery();
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateGoalModal />
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <GoalsList items={data.goals} />
        </CardContent>
      </Card>
    </div>
  );
}
