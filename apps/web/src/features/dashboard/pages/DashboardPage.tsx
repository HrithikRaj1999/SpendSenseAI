import { useGetDashboardQuery } from "../api/dashboardApi";
import { SummaryCards } from "../components/SummaryCards";
import { SpendTrendChart } from "../components/SpendTrendChart";
import { CategoryPieChart } from "../components/CategoryPieChart";
import { RecentExpenses } from "../components/RecentExpenses";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { Sparkles, Calendar } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const month = searchParams.get("month") || currentMonth;

  const { data, isLoading, isFetching, error } = useGetDashboardQuery({
    month,
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/30 p-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <Sparkles className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Oops, something went wrong
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We couldn't load your financial data. Please check your connection and
          try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Overview
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {today} • {month}
            </span>
          </div>
        </div>

        {isFetching && (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
            Syncing Data...
          </span>
        )}
      </div>

      <SummaryCards {...data.summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendTrendChart data={data.trend} />
        </div>
        <div className="lg:col-span-2">
          <CategoryPieChart data={data.categories} />
        </div>
      </div>

      <RecentExpenses data={data.recent} />
    </div>
  );
}
