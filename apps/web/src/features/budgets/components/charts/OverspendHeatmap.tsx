import type { OverspendHeatCell, Severity } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function cellClass(s: Severity) {
  if (s === "DANGER") return "bg-destructive/25";
  if (s === "WARN") return "bg-amber-500/20";
  return "bg-emerald-500/15";
}

export function OverspendHeatmap({ cells }: { cells: OverspendHeatCell[] }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overspend heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {cells.slice(0, 31).map((c) => (
            <div
              key={c.day}
              title={`Day ${c.day}: ₹${Math.round(c.value)}`}
              className={cn("h-8 rounded-xl ring-1 ring-black/5 flex items-center justify-center text-xs", cellClass(c.severity))}
            >
              {c.day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
