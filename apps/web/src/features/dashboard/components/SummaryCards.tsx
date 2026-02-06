import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { Wallet, TrendingUp, PiggyBank, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  monthSpend: number;
  monthBudget: number;
  savingsEstimate: number;
  biggestCategory: string;
};

const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  gradient,
  trend,
}: any) => (
  <Card className="relative overflow-hidden border-0 bg-white/50 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
    <div
      className={cn(
        "absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full opacity-10 blur-2xl",
        gradient,
      )}
    />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend > 75
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            {trend}% Used
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight">{value}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      </div>
      {/* Progress Bar for Budget */}
      {trend !== undefined && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              gradient,
            )}
            style={{ width: `${Math.min(trend, 100)}%` }}
          />
        </div>
      )}
    </CardContent>
  </Card>
);

export const SummaryCards = React.memo(function SummaryCards(props: Props) {
  const budgetUsedPct =
    props.monthBudget > 0
      ? Math.round((props.monthSpend / props.monthBudget) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Spend"
        value={formatINR(props.monthSpend)}
        subtext="This month"
        icon={Wallet}
        gradient="from-indigo-500 to-purple-600"
        trend={budgetUsedPct}
      />
      <MetricCard
        title="Monthly Budget"
        value={formatINR(props.monthBudget)}
        subtext="Planned Limit"
        icon={TrendingUp}
        gradient="from-blue-500 to-cyan-500"
      />
      <MetricCard
        title="Projected Savings"
        value={formatINR(props.savingsEstimate)}
        subtext="Remaining Balance"
        icon={PiggyBank}
        gradient="from-emerald-500 to-teal-500"
      />
      <MetricCard
        title="Top Category"
        value={props.biggestCategory}
        subtext="Most Active"
        icon={AlertCircle}
        gradient="from-orange-500 to-pink-500"
      />
    </div>
  );
});
