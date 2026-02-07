import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AiSuggestion } from "../../utils/types";
import { toINR } from "../../utils/budgetMath";

export function AiSuggestionsCard({
  items,
  onApply,
}: {
  items: AiSuggestion[];
  onApply?: (id: string) => void;
}) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">AI Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No suggestions right now.</div>
        ) : (
          items.slice(0, 4).map((s) => (
            <div key={s.id} className="rounded-2xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.detail}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Estimated impact: <span className="font-medium">{toINR(s.impactINR)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-xl"
                  variant="secondary"
                  onClick={() => onApply?.(s.id)}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
