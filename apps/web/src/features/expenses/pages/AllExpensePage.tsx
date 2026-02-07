import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  Filter,
  Receipt,
  ChevronUp,
  ChevronDown,
  Trash2,
  Undo2,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { formatINR } from "@/lib/utils";

import type { Txn, PaymentMethod } from "@/features/expenses/types";
import type { Timeframe } from "../types";
import {
  useGetExpensesQuery,
  useUpdateExpenseMutation,
  useSoftDeleteExpensesMutation,
  useRestoreExpensesMutation,
  useSoftDeleteByFilterMutation,
  useBulkUpdateExpensesMutation,
  useBulkUpdateByFilterMutation,
} from "../api/expensesApi";

// CSV
function toCsv(rows: Txn[]) {
  const header = ["Date", "Title", "Category", "Payment Method", "Amount"];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n"))
      return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  return [
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
  ].join("\n");
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
type SortField = "date" | "amount" | "title" | "category" | "paymentMethod";

export default function AllExpensePage() {
  const nav = useNavigate();

  // ---------- sort (click headers) ----------
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(f);
      setSortOrder("desc");
    }
  };

  // ---------- timeframe + filters ----------
  const [timeframe, setTimeframe] = React.useState<Timeframe>("month");
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const defaultYear = now.getFullYear();

  const [month, setMonth] = React.useState(defaultMonth);
  const [quarter, setQuarter] = React.useState(`${defaultYear}-Q1`);
  const [year, setYear] = React.useState(defaultYear);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>(ALL);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(ALL);

  // pagination
  const [page, setPage] = React.useState(1);
  const limit = 25;

  React.useEffect(
    () => setPage(1),
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
    ],
  );

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

  // dropdown choices
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
  const methods = React.useMemo<PaymentMethod[] | string[]>(
    () => [ALL, "UPI", "Card", "NetBanking", "Cash"],
    [],
  );

  // ---------- Selection model (supports "Select all across pages") ----------
  // Mode A: manual selection by ids
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  // Mode B: select ALL matching (across all pages) with exclusions
  const [selectAllMatching, setSelectAllMatching] = React.useState(false);
  const [excluded, setExcluded] = React.useState<Record<string, boolean>>({});

  // reset selection when query changes
  React.useEffect(() => {
    setSelected({});
    setSelectAllMatching(false);
    setExcluded({});
  }, [
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
  ]);

  const isRowChecked = (id: string) => {
    if (selectAllMatching) return !excluded[id];
    return !!selected[id];
  };

  const setRowChecked = (id: string, checked: boolean) => {
    if (selectAllMatching) {
      setExcluded((prev) => ({ ...prev, [id]: !checked }));
    } else {
      setSelected((prev) => ({ ...prev, [id]: checked }));
    }
  };

  const allOnPageChecked =
    rows.length > 0 && rows.every((r) => isRowChecked(r.id));
  const someOnPageChecked =
    rows.some((r) => isRowChecked(r.id)) && !allOnPageChecked;

  const toggleSelectAllOnPage = () => {
    const next = !allOnPageChecked;
    rows.forEach((r) => setRowChecked(r.id, next));
  };

  const selectedCount = React.useMemo(() => {
    if (selectAllMatching) {
      const excludedCount = Object.values(excluded).filter(Boolean).length;
      return Math.max(0, total - excludedCount);
    }
    return Object.values(selected).filter(Boolean).length;
  }, [selectAllMatching, excluded, selected, total]);

  const clearSelection = () => {
    setSelected({});
    setSelectAllMatching(false);
    setExcluded({});
  };

  // ---------- Mutations ----------
  const [updateExpense] = useUpdateExpenseMutation();
  const [softDeleteIds, delIdsState] = useSoftDeleteExpensesMutation();
  const [restoreIds, restoreState] = useRestoreExpensesMutation();
  const [softDeleteByFilter, delFilterState] = useSoftDeleteByFilterMutation();
  const [bulkUpdateIds, bulkUpdIdsState] = useBulkUpdateExpensesMutation();
  const [bulkUpdateByFilter, bulkUpdFilterState] =
    useBulkUpdateByFilterMutation();

  // ---------- Undo delete banner ----------
  const [undoOpen, setUndoOpen] = React.useState(false);
  const [lastDeletedIds, setLastDeletedIds] = React.useState<string[]>([]);
  const undoTimer = React.useRef<number | null>(null);

  const showUndo = (ids: string[]) => {
    setLastDeletedIds(ids);
    setUndoOpen(true);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoOpen(false), 8000);
  };

  const undoDelete = async () => {
    if (lastDeletedIds.length === 0) return;
    await restoreIds({ ids: lastDeletedIds }).unwrap();
    setUndoOpen(false);
    setLastDeletedIds([]);
  };

  // ---------- Receipt viewer ----------
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [receiptTxn, setReceiptTxn] = React.useState<Txn | null>(null);
  const openReceipt = (t: Txn) => {
    setReceiptTxn(t);
    setReceiptOpen(true);
  };

  // ---------- Bulk edit dialog ----------
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  const [bulkCategory, setBulkCategory] = React.useState<string>(ALL);
  const [bulkMethod, setBulkMethod] = React.useState<string>(ALL);

  const applyBulkEdit = async () => {
    const patch: Partial<Txn> = {};
    if (bulkCategory !== ALL) patch.category = bulkCategory;
    if (bulkMethod !== ALL) patch.paymentMethod = bulkMethod as any;
    if (Object.keys(patch).length === 0) {
      setBulkEditOpen(false);
      return;
    }

    if (selectAllMatching) {
      const excludeIds = Object.keys(excluded).filter((k) => excluded[k]);
      await bulkUpdateByFilter({
        args: { ...args, page: 1 },
        patch,
        excludeIds,
      }).unwrap();
    } else {
      const ids = Object.keys(selected).filter((k) => selected[k]);
      await bulkUpdateIds({ ids, patch }).unwrap();
    }

    setBulkEditOpen(false);
    clearSelection();
  };

  // ---------- Bulk delete confirmation ----------
  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false);

  const doBulkDelete = async () => {
    if (selectAllMatching) {
      const excludeIds = Object.keys(excluded).filter((k) => excluded[k]);
      // Perform delete by filter. For undo we’ll restore only CURRENT PAGE ids by default (safe + fast).
      await softDeleteByFilter({
        args: { ...args, page: 1 },
        excludeIds,
      }).unwrap();
      // For undo: restore everything is possible, but would require server-side "restoreByFilter".
      // We'll undo page ids + you can later add restoreByFilter similarly.
      const pageIds = rows
        .map((r) => r.id)
        .filter((id) => !excludeIds.includes(id));
      showUndo(pageIds);
    } else {
      const ids = Object.keys(selected).filter((k) => selected[k]);
      await softDeleteIds({ ids }).unwrap();
      showUndo(ids);
    }

    setConfirmBulkDelete(false);
    clearSelection();
  };

  const exportName = React.useMemo(() => {
    if (timeframe === "month") return `expenses_${month}`;
    if (timeframe === "quarter") return `expenses_${quarter}`;
    if (timeframe === "year") return `expenses_${year}`;
    return `expenses_custom`;
  }, [timeframe, month, quarter, year]);

  const exportThisPage = () => downloadCsv(`${exportName}.csv`, toCsv(rows));
  const exportSelectedPageOnly = () =>
    downloadCsv(
      `${exportName}_selected.csv`,
      toCsv(rows.filter((r) => isRowChecked(r.id))),
    );

  const SortIcon = ({ f }: { f: SortField }) => {
    if (sortField !== f) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const busy =
    isFetching ||
    delIdsState.isLoading ||
    delFilterState.isLoading ||
    bulkUpdIdsState.isLoading ||
    bulkUpdFilterState.isLoading;

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
          </div>
        </div>

        {/* Updated Action Buttons with Horizontal Scroll */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-none sm:scrollbar-thin">
          <div className="flex w-max items-center gap-2">
            {isFetching && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border whitespace-nowrap">
                Syncing Data...
              </span>
            )}

            <Button
              className="rounded-2xl whitespace-nowrap"
              onClick={exportThisPage}
              disabled={rows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Page
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl whitespace-nowrap"
              onClick={exportSelectedPageOnly}
              disabled={
                rows.length === 0 || rows.every((r) => !isRowChecked(r.id))
              }
            >
              Export Selected
            </Button>
          </div>
        </div>
      </div>

      {/* Undo banner */}
      {undoOpen && (
        <div className="flex flex-col gap-2 rounded-2xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Deleted {lastDeletedIds.length} expense(s).{" "}
            <span className="text-muted-foreground">(Soft-deleted)</span>
          </p>
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={undoDelete}
            disabled={restoreState.isLoading}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Undo
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Filter className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Filters
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="w-full overflow-x-auto pb-3 scrollbar-none sm:scrollbar-thin">
            <div className="flex w-max items-center gap-4">
              {(["month", "quarter", "year", "custom"] as Timeframe[]).map(
                (t) => (
                  <Button
                    key={t}
                    variant={timeframe === t ? "default" : "secondary"}
                    className="rounded-2xl whitespace-nowrap" // Added whitespace-nowrap
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
          </div>

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
                {(methods as string[]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Receipt className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                All Expenses
              </CardTitle>
              <Badge variant="secondary" className="rounded-xl">
                {total} records
              </Badge>
            </div>

            {/* Bulk actions */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCount > 0 && (
                <>
                  <Badge variant="secondary" className="rounded-xl">
                    Selected: {selectedCount}
                    {selectAllMatching ? " (all matching)" : ""}
                  </Badge>

                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={() => {
                      setBulkCategory(ALL);
                      setBulkMethod(ALL);
                      setBulkEditOpen(true);
                    }}
                    disabled={busy}
                  >
                    Bulk Edit
                  </Button>

                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                    onClick={() => setConfirmBulkDelete(true)}
                    disabled={busy}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete
                  </Button>

                  <Button
                    variant="ghost"
                    className="rounded-2xl"
                    onClick={clearSelection}
                    disabled={busy}
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Select all across pages banner */}
          {rows.length > 0 &&
            allOnPageChecked &&
            !selectAllMatching &&
            total > rows.length && (
              <div className="rounded-2xl border bg-background p-3 text-sm">
                All {rows.length} items on this page are selected.{" "}
                <button
                  className="font-semibold underline underline-offset-4"
                  onClick={() => setSelectAllMatching(true)}
                >
                  Select all {total} matching results
                </button>
              </div>
            )}

          {selectAllMatching && (
            <div className="rounded-2xl border bg-background p-3 text-sm">
              All <span className="font-semibold">{total}</span> matching
              results are selected
              {Object.values(excluded).filter(Boolean).length > 0
                ? ` (excluding ${Object.values(excluded).filter(Boolean).length}).`
                : "."}{" "}
              <button
                className="font-semibold underline underline-offset-4"
                onClick={clearSelection}
              >
                Clear selection
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No expenses found for this filter.
            </div>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-sm min-w-[600px] sm:min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-2 text-left">
                      <Checkbox
                        checked={
                          allOnPageChecked
                            ? true
                            : someOnPageChecked
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleSelectAllOnPage}
                        aria-label="Select all on page"
                      />
                    </th>

                    <th className="py-2 text-left">
                      <button
                        className="inline-flex items-center font-semibold"
                        onClick={() => toggleSort("title")}
                      >
                        Title <SortIcon f="title" />
                      </button>
                    </th>

                    <th className="py-2 text-left">
                      <button
                        className="inline-flex items-center font-semibold"
                        onClick={() => toggleSort("date")}
                      >
                        Date <SortIcon f="date" />
                      </button>
                    </th>

                    <th className="py-2 text-left">
                      <button
                        className="inline-flex items-center font-semibold"
                        onClick={() => toggleSort("category")}
                      >
                        Category <SortIcon f="category" />
                      </button>
                    </th>

                    <th className="py-2 text-left">
                      <button
                        className="inline-flex items-center font-semibold"
                        onClick={() => toggleSort("paymentMethod")}
                      >
                        Method <SortIcon f="paymentMethod" />
                      </button>
                    </th>

                    <th className="py-2 text-right">
                      <button
                        className="inline-flex items-center justify-end font-semibold"
                        onClick={() => toggleSort("amount")}
                      >
                        Amount <SortIcon f="amount" />
                      </button>
                    </th>

                    <th className="py-2 text-right">Receipt</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="py-3 pr-2 align-top">
                        <Checkbox
                          checked={isRowChecked(t.id)}
                          onCheckedChange={(v) => setRowChecked(t.id, !!v)}
                        />
                      </td>

                      <td className="py-3 align-top">
                        <div className="max-w-[340px]">
                          <p className="truncate font-semibold">{t.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {t.id}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 align-top text-muted-foreground">
                        {format(new Date(t.date), "dd MMM yyyy, hh:mm a")}
                      </td>

                      {/* ✅ Inline category edit */}
                      <td className="py-3 align-top">
                        <select
                          className="h-9 rounded-xl border bg-background px-2 text-sm"
                          value={t.category}
                          onChange={(e) =>
                            updateExpense({
                              id: t.id,
                              patch: { category: e.target.value },
                            })
                          }
                        >
                          {categories
                            .filter((c) => c !== ALL)
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>
                      </td>

                      {/* ✅ Inline payment method edit */}
                      <td className="py-3 align-top">
                        <select
                          className="h-9 rounded-xl border bg-background px-2 text-sm"
                          value={t.paymentMethod}
                          onChange={(e) =>
                            updateExpense({
                              id: t.id,
                              patch: { paymentMethod: e.target.value as any },
                            })
                          }
                        >
                          {(methods as string[])
                            .filter((m) => m !== ALL)
                            .map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="py-3 align-top text-right font-bold">
                        - {formatINR(t.amount)}
                      </td>

                      <td className="py-3 align-top text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-2xl"
                          onClick={() => openReceipt(t)}
                          disabled={!t.receiptUrl}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* pagination */}
          <div className="flex items-center justify-between pt-2">
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

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Bulk Edit ({selectedCount})</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Category
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose “All” to leave unchanged.
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Payment Method
              </p>
              <select
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={bulkMethod}
                onChange={(e) => setBulkMethod(e.target.value)}
              >
                {(methods as string[]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose “All” to leave unchanged.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => setBulkEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-2xl"
              onClick={applyBulkEdit}
              disabled={busy}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Bulk Delete */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} expense(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a soft delete. You’ll get an Undo option for a few
              seconds.
              {selectAllMatching
                ? " (This applies to ALL matching pages.)"
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl"
              onClick={doBulkDelete}
              disabled={busy}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Viewer */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>

          {!receiptTxn?.receiptUrl ? (
            <div className="text-sm text-muted-foreground">
              No receipt attached.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
                <div className="font-semibold">{receiptTxn.title}</div>
                <div className="text-muted-foreground">
                  {format(new Date(receiptTxn.date), "dd MMM yyyy, hh:mm a")} •{" "}
                  {receiptTxn.category} • {receiptTxn.paymentMethod}
                </div>
              </div>

              <img
                src={receiptTxn.receiptUrl}
                alt="Receipt"
                className="w-full rounded-2xl border object-contain"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => setReceiptOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
