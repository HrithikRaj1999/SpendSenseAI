import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { MonthHistoryList } from "../components/lists/MonthHistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsHistoryPage() {
  const { data } = useGetActiveBudgetQuery();
  if (!data) return null;

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent>
        <MonthHistoryList items={data.history} />
      </CardContent>
    </Card>
  );
}
