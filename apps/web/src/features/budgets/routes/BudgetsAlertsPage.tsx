import { useGetActiveBudgetQuery, useToggleAlertRuleMutation } from "../api/budgetsApi";
import { AlertsRulesList } from "../components/lists/AlertsRulesList";
import { CreateAlertRuleModal } from "../components/modals/CreateAlertRuleModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsAlertsPage() {
  const { data } = useGetActiveBudgetQuery();
  const [toggle] = useToggleAlertRuleMutation();
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateAlertRuleModal />
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alert Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AlertsRulesList
            items={data.alertRules}
            onToggle={(id, enabled) => toggle({ id, enabled })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
