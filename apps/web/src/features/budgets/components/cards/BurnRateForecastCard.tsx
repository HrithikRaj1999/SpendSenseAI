import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BurnRateForecast } from "../../utils/types";

export function BurnRateForecastCard({ forecast }: { forecast: BurnRateForecast }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Burn Rate Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">{forecast.note}</div>
        {forecast.riskCategory ? (
          <div className="text-sm">
            <span className="font-medium">{forecast.riskCategory}</span>{" "}
            at risk ({forecast.riskPercent ?? 0}%)
          </div>
        ) : null}
        {forecast.projectedRunoutDate ? (
          <div className="text-sm">
            Projected runout:{" "}
            <span className="font-medium">{new Date(forecast.projectedRunoutDate).toDateString()}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
