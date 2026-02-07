import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryBudget } from "../../utils/types";
import { SeverityPill } from "../ui/SeverityPill";

export function OverspendRiskCard({ categories }: { categories: CategoryBudget[] }) {
  const risky = [...categories]
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, 3);

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overspend Risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {risky.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{c.category}</span>
              <SeverityPill severity={c.severity} />
            </div>
            <div className="text-muted-foreground">{c.percentUsed}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
