import type { OverspendHeatCell, Severity } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getSeverityStyles(s: Severity) {
  if (s === "DANGER") {
    return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-red-400 ring-destructive/20";
  }
  if (s === "WARN") {
    return "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-amber-500/20";
  }
  return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-emerald-500/20";
}

export function OverspendHeatmap({ cells }: { cells: OverspendHeatCell[] }) {
  // Take exactly 31 cells or fewer
  const displayCells = cells.slice(0, 31);

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5 bg-card text-card-foreground overflow-hidden w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            Overspend heatmap
          </CardTitle>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Last 31 Days
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* - Grid remains 7 cols for a calendar-like feel 
          - gap-1.5 is more compact for mobile 
        */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          <TooltipProvider delayDuration={100}>
            {displayCells.map((c) => (
              <Tooltip key={c.day}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square sm:h-10 flex items-center justify-center rounded-xl text-[10px] sm:text-xs font-bold ring-1 transition-all hover:scale-110 cursor-default",
                      getSeverityStyles(c.severity),
                    )}
                  >
                    {c.day}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="rounded-xl font-bold">
                  Day {c.day}: ₹{Math.round(c.value)}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Subtle Legend for Theme Clarity */}
        <div className="mt-6 flex items-center justify-end gap-3 px-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Warn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Over</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
