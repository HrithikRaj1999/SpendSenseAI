import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
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
} from "recharts";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
];

export default function ExpenseInsightsPage() {
  const nav = useNavigate();
  const [month, setMonth] = React.useState("2026-02");

  const { data, isFetching } = useGetExpenseInsightsQuery({ month });
  const dto = data;

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => nav(ROUTES.EXPENSES)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Expense Insights
            </h1>
            <p className="text-sm text-muted-foreground">
              Visual breakdown of your spending for a month.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFetching && (
            <Badge variant="secondary" className="rounded-xl">
              Syncing…
            </Badge>
          )}
          <input
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="YYYY-MM"
          />
        </div>
      </div>

      {!dto ? null : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    Total Spend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {formatINR(dto.totals.spend)}
                <p className="mt-1 text-xs text-muted-foreground">
                  {dto.totals.txns} transactions in {dto.totals.month}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    Top Category
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {dto.byCategory[0]?.name ?? "—"}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatINR(dto.byCategory[0]?.amount ?? 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Unusual Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {dto.unusual.length} large transactions flagged
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3 rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">By Category</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dto.byCategory.slice(0, 8)}>
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" radius={10} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">By Method</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dto.byMethod}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {dto.byMethod.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
