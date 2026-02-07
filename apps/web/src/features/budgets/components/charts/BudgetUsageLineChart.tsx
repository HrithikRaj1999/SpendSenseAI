import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { BudgetUsagePoint } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export function BudgetUsageLineChart({ data }: { data: BudgetUsagePoint[] }) {
  // Memoize data and colors for performance and theme stability
  const safeData = React.useMemo(() => data.slice(-30), [data]);

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5 bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">
          Spending over time
        </CardTitle>
      </CardHeader>

      {/* Responsive height: 
        - h-[260px] on small mobile
        - md:h-[320px] on desktop 
      */}
      <CardContent className="h-[260px] md:h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={safeData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted/30"
            />
            <XAxis dataKey="date" hide />
            <YAxis hide domain={["auto", "auto"]} />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              itemStyle={{ fontWeight: "bold" }}
              formatter={(value: number | undefined) => [
                formatINR(value || 0),
                "",
              ]}
              labelClassName="hidden"
            />

            {/* Theme Aware Lines:
              - 'Spent' uses the Primary color (Indigo/Violet)
              - 'Budget' uses a Muted/Border color for a dashed look
            */}
            <Line
              type="monotone"
              dataKey="spent"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="budgetLine"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
