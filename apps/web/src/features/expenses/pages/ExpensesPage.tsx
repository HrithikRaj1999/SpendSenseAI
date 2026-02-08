import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Download, Filter, Receipt, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { formatINR } from "@/lib/utils";

import { useGetExpensesQuery } from "../api/expensesApi";
import { Expense, Timeframe } from "../types";

function toCsv(rows: Expense[]) {
  const header = ["Date", "Title", "Category", "Payment Method", "Amount"];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escape(format(new Date(r.date), "dd MMM yyyy, hh:mm a")),
        escape(r.title),
        escape(r.category),
        escape(r.paymentMethod),
        escape(r.amount),
      ].join(","),
    ),
  ];

  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

const ALL = "All";

export default function ExpensesPage() {
  const nav = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [sortField, setSortField] = React.useState<
    "date" | "amount" | "title" | "category" | "paymentMethod"
  >("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // timeframe
  const [timeframe, setTimeframe] = React.useState<Timeframe>("month");

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const defaultYear = now.getFullYear();

  // D1. Single source of truth for month
  const urlMonth = searchParams.get("month");
  const [month, setMonth] = React.useState(urlMonth || defaultMonth);

  // Sync state -> URL
  React.useEffect(() => {
    if (timeframe === "month") {
      const current = searchParams.get("month");
      if (current !== month) {
        setSearchParams(
          (prev) => {
            prev.set("month", month);
            return prev;
          },
          { replace: true },
        );
      }
    }
  }, [month, timeframe, setSearchParams, searchParams]);

  const [quarter, setQuarter] = React.useState(`${defaultYear}-Q1`);
  const [year, setYear] = React.useState(defaultYear);

  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  // filters
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>(ALL);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(ALL);

  // pagination
  const [page, setPage] = React.useState(1);
  const limit = 25;

  React.useEffect(() => {
    setPage(1);
  }, [
    timeframe,
    month,
    quarter,
    year,
    from,
    to,
    category,
    paymentMethod,
    search,
    sortField,
    sortOrder,
  ]);

  const args = React.useMemo(
    () => ({
      timeframe,
      month: timeframe === "month" ? month : undefined,
      quarter: timeframe === "quarter" ? quarter : undefined,
      year: timeframe === "year" ? year : undefined,
      from: timeframe === "custom" ? from : undefined,
      to: timeframe === "custom" ? to : undefined,
      search,
      category,
      paymentMethod,
      sortField,
      sortOrder,
      page,
      limit,
    }),
    [
      timeframe,
      month,
      quarter,
      year,
      from,
      to,
      search,
      category,
      paymentMethod,
      sortField,
      sortOrder,
      page,
    ],
  );

  const { data, isLoading, isFetching } = useGetExpensesQuery(args);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const categories = React.useMemo(
    () => [
      ALL,
      "Food & Dining",
      "Transport",
      "Shopping",
      "Bills",
      "Entertainment",
      "Health",
      "Rent",
      "Groceries",
    ],
    [],
  );
  const methods = React.useMemo(
    () => [ALL, "UPI", "Card", "NetBanking", "Cash"],
    [],
  );

  const exportName = React.useMemo(() => {
    if (timeframe === "month") return `expenses_${month}`;
    if (timeframe === "quarter") return `expenses_${quarter}`;
    if (timeframe === "year") return `expenses_${year}`;
    return `expenses_custom`;
  }, [timeframe, month, quarter, year]);

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => nav(ROUTES.DASHBOARD)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Expenses
            </h1>
            <p className="text-sm text-muted-foreground">
              Filter by timeframe, search, sort, and export like a bank
              statement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
              Syncing Data...
            </span>
          )}

          <Button
            className="rounded-2xl"
            onClick={() => downloadCsv(`${exportName}.csv`, toCsv(rows))}
            disabled={rows.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Filter className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Filters
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* timeframe selector */}
          <div className="flex flex-wrap gap-2">
            {(["month", "quarter", "year", "custom"] as Timeframe[]).map(
              (t) => (
                <Button
                  key={t}
                  variant={timeframe === t ? "default" : "secondary"}
                  className="rounded-2xl"
                  onClick={() => setTimeframe(t)}
                >
                  {t === "month"
                    ? "Monthly"
                    : t === "quarter"
                      ? "Quarterly"
                      : t === "year"
                        ? "Yearly"
                        : "Custom"}
                </Button>
              ),
            )}
          </div>

          {/* timeframe inputs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {timeframe === "month" && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Month (YYYY-MM)
                </p>
                <Input
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="2026-02"
                />
              </div>
            )}

            {timeframe === "quarter" && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Quarter (YYYY-Q1..Q4)
                </p>
                <Input
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  placeholder="2026-Q1"
                />
              </div>
            )}

            {timeframe === "year" && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Year
                </p>
                <Input
                  value={String(year)}
                  onChange={(e) =>
                    setYear(Number(e.target.value || defaultYear))
                  }
                  placeholder="2026"
                />
              </div>
            )}

            {timeframe === "custom" && (
              <>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    From (ISO)
                  </p>
                  <Input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="2026-02-01T00:00:00.000Z"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    To (ISO)
                  </p>
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="2026-02-28T23:59:59.000Z"
                  />
                </div>
              </>
            )}

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Search
              </p>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="swiggy, rent, bills..."
              />
            </div>
          </div>

          {/* dropdown filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Category
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Payment Method
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* sort controls */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Sort Field
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={sortField}
                onChange={(e) =>
                  setSortField(
                    e.target.value as
                      | "date"
                      | "amount"
                      | "title"
                      | "category"
                      | "paymentMethod",
                  )
                }
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
                <option value="category">Category</option>
                <option value="paymentMethod">Payment Method</option>
              </select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Sort Order
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Receipt className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                All Expenses
              </CardTitle>
            </div>

            <Badge variant="secondary" className="rounded-xl">
              {total} records
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No expenses found for this filter.
            </div>
          ) : (
            rows.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {e.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {format(new Date(e.date), "dd MMM, hh:mm a")} • {e.category}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-sm font-bold text-foreground">
                    - {formatINR(e.amount)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {e.paymentMethod}
                  </Badge>
                </div>
              </div>
            ))
          )}

          {/* pagination */}
          <div className="flex items-center justify-between pt-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
