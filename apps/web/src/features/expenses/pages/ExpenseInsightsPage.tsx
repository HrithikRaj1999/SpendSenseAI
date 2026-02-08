import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useGetExpenseInsightsQuery } from "../api/insightsApi";
import { formatINR } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

// Theme-aware colors using CSS variables
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ExpenseInsightsPage() {
  const nav = useNavigate();
  const [month, setMonth] = React.useState("2026-02");

  const { data: dto, isFetching } = useGetExpenseInsightsQuery({ month });

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/50 shadow-sm ring-1 ring-border"
            onClick={() => nav(ROUTES.EXPENSES)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Expense Insights
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              Deep dive into your {format(new Date(month + "-01"))} spending
              behaviors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold animate-pulse">
              <Sparkles className="h-3 w-3" />
              Syncing
            </div>
          )}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="month"
              className="h-11 rounded-2xl border bg-card pl-10 pr-4 text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-primary outline-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!dto ? (
        <div className="flex h-64 items-center justify-center rounded-[2rem] border-2 border-dashed border-border/50">
          <p className="text-muted-foreground font-medium">
            No data available for this month.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[2rem] border-none bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-xl shadow-indigo-500/20">
              <div className="rounded-[1.9rem] bg-card p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Spend
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground">
                  {formatINR(dto.totals.spend)}
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  Across {dto.totals.txns} transactions
                </p>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-0 shadow-lg ring-1 ring-black/5 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Top Category
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground truncate">
                  {dto.byCategory[0]?.name ?? "—"}
                </div>
                <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(dto.byCategory[0]?.amount ?? 0)} spent
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-0 shadow-lg ring-1 ring-black/5 bg-card overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Alerts
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground">
                  {dto.unusual.length}
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground leading-snug">
                  Unusual large transactions flagged.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3 rounded-[2.5rem] border-0 shadow-xl ring-1 ring-black/5 bg-card">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xl font-bold tracking-tight">
                  Spend by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] p-4 sm:p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dto.byCategory.slice(0, 6)}
                    margin={{ top: 20 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      className="text-[10px] font-bold fill-muted-foreground"
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "16px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(v: number | undefined) => [
                        formatINR(v || 0),
                        "",
                      ]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[12, 12, 4, 4]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-[2.5rem] border-0 shadow-xl ring-1 ring-black/5 bg-card">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xl font-bold tracking-tight">
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dto.byMethod}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      cornerRadius={8}
                      stroke="none"
                    >
                      {dto.byMethod.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "16px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Helper to format MMMM yyyy
function format(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
