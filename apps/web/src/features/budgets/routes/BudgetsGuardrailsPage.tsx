import { useGetActiveBudgetQuery, useToggleGuardrailMutation } from "../api/budgetsApi";
import { GuardrailsList } from "../components/lists/GuardrailsList";
import { CreateGuardrailModal } from "../components/modals/CreateGuardrailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetsGuardrailsPage() {
  const { data } = useGetActiveBudgetQuery();
  const [toggle] = useToggleGuardrailMutation();
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateGuardrailModal />
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <GuardrailsList items={data.guardrails} onToggle={(id, enabled) => toggle({ id, enabled })} />
        </CardContent>
      </Card>
    </div>
  );
}
