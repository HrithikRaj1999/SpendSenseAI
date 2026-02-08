import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { BudgetSummaryCard } from "../components/cards/BudgetSummaryCard";
import { BudgetHealthScoreCard } from "../components/cards/BudgetHealthScoreCard";
import { BurnRateForecastCard } from "../components/cards/BurnRateForecastCard";
import { DailyAllowanceCard } from "../components/cards/DailyAllowanceCard";
import { OverspendRiskCard } from "../components/cards/OverspendRiskCard";
import { AiSuggestionsCard } from "../components/cards/AiSuggestionsCard";
import { BudgetUsageLineChart } from "../components/charts/BudgetUsageLineChart";
import { CategoryBudgetBarChart } from "../components/charts/CategoryBudgetBarChart";
import { OverspendHeatmap } from "../components/charts/OverspendHeatmap";

export function BudgetsOverviewPage() {
  const { data } = useGetActiveBudgetQuery();
  if (!data) return null;

  if (!data.budget) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center animate-in fade-in">
        <div className="rounded-full bg-muted p-4">
          <span className="text-2xl">📊</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">No Budget Set</h3>
          <p className="text-sm text-muted-foreground">
            Creates a budget to see analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <BudgetSummaryCard summary={data.summary} />
        <DailyAllowanceCard summary={data.summary} />
        <BudgetHealthScoreCard health={data.health} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BurnRateForecastCard forecast={data.forecast} />
        <OverspendRiskCard categories={data.categories} />
        <AiSuggestionsCard items={data.suggestions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetUsageLineChart data={data.usageSeries} />
        <CategoryBudgetBarChart data={data.categories} />
      </div>

      <OverspendHeatmap cells={data.heatmap} />
    </div>
  );
}
