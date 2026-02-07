import { useGetActiveBudgetQuery } from "../api/budgetsApi";
import { BudgetHealthScoreCard } from "../components/cards/BudgetHealthScoreCard";
import { BurnRateForecastCard } from "../components/cards/BurnRateForecastCard";
import { AiSuggestionsCard } from "../components/cards/AiSuggestionsCard";
import { OverspendRiskCard } from "../components/cards/OverspendRiskCard";

export function BudgetsInsightsPage() {
  const { data } = useGetActiveBudgetQuery();
  if (!data) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BudgetHealthScoreCard health={data.health} />
      <BurnRateForecastCard forecast={data.forecast} />
      <OverspendRiskCard categories={data.categories} />
      <AiSuggestionsCard items={data.suggestions} />
    </div>
  );
}
