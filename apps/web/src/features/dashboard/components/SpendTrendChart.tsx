import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TrendPoint } from "../utils/types";
import { formatINR } from "@/lib/utils";
import { Activity } from "lucide-react";

type Props = { data: TrendPoint[] };

export const SpendTrendChart = React.memo(function SpendTrendChart({
  data,
}: Props) {
  const chartData = React.useMemo(
    () => data.map((d) => ({ ...d, label: d.date.slice(5) })),
    [data],
  );

  return (
    <Card className="col-span-3 rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Activity size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-800">
              Spending Analytics
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Daily spending flow over time
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[220px] sm:h-[280px] lg:h-[350px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any) => [formatINR(Number(value)), "Spend"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
