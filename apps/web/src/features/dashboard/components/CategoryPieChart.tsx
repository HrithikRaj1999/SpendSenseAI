import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import type { CategorySpend } from "../utils/types";
import { formatINR } from "@/lib/utils";
import { PieChart as PieIcon } from "lucide-react";

type Props = { data: CategorySpend[] };

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
];

export const CategoryPieChart = React.memo(function CategoryPieChart({
  data,
}: Props) {
  const pieData = React.useMemo(
    () => data.map((c) => ({ name: c.name, value: c.amount })),
    [data],
  );

  return (
    <Card className="flex flex-col rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
            <PieIcon size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-800">
              Distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Expenses by category
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="h-[180px] sm:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                formatter={(v: any) => formatINR(Number(v))}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                cornerRadius={5}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.slice(0, 4).map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-xs dark:bg-zinc-800/50"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex flex-1 justify-between">
                <span className="font-medium text-muted-foreground truncate max-w-[120px]">
                  {c.name}
                </span>
                <span className="font-bold text-gray-900">
                  {formatINR(c.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
