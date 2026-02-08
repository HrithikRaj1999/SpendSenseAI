import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { CategoryBudget } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export function CategoryBudgetBarChart({ data }: { data: CategoryBudget[] }) {
  const chartData = React.useMemo(
    () =>
      data.map((c) => ({
        name: c.category,
        spent: c.spent,
        limit: c.limit,
        // Calculate remaining to ensure visual stability in stacking if needed
        remaining: Math.max(0, c.limit - c.spent),
      })),
    [data],
  );

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5 bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">
          Category spend vs limit
        </CardTitle>
      </CardHeader>

      {/* Responsive Height: Matches the line chart for visual symmetry */}
      <CardContent className="p-4">
        <div className="h-[260px] md:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical" // Switching to vertical makes category names much easier to read on mobile
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
                className="text-[10px] font-medium fill-muted-foreground"
              />

              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(
                  value: number | undefined,
                  name: string | undefined,
                ) => [
                  formatINR(value || 0),
                  name ? name.charAt(0).toUpperCase() + name.slice(1) : "",
                ]}
              />

              {/* Background Bar (The Limit) */}
              <Bar
                dataKey="limit"
                fill="hsl(var(--muted))"
                radius={[0, 8, 8, 0]}
                barSize={12}
                opacity={0.3}
              />

              {/* Foreground Bar (The Spent) */}
              <Bar dataKey="spent" radius={[0, 8, 8, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // If spending exceeds limit, color it red (destructive), else primary
                    fill={
                      entry.spent > entry.limit
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--primary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
