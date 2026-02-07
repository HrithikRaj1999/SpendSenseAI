import * as React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { BudgetUsagePoint } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetUsageLineChart({ data }: { data: BudgetUsagePoint[] }) {
  const safe = React.useMemo(() => data.slice(-30), [data]);

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending over time</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safe}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="spent" stroke="currentColor" dot={false} />
            <Line type="monotone" dataKey="budgetLine" stroke="currentColor" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
