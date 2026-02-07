import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function BudgetProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Progress value={value} className="h-2 rounded-full" />
      <div className="text-xs text-muted-foreground">{value}% used</div>
    </div>
  );
}
