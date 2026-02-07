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
