import * as React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { CategoryBudget } from "../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryBudgetBarChart({ data }: { data: CategoryBudget[] }) {
  const d = React.useMemo(
    () =>
      data.map((c) => ({
        name: c.category,
        spent: c.spent,
        limit: c.limit,
      })),
    [data],
  );

  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Category spend vs limit</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={d}>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="limit" fill="currentColor" opacity={0.25} />
            <Bar dataKey="spent" fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
