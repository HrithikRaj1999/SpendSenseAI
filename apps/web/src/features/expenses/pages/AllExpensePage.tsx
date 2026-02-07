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
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { cn, formatINR } from "@/lib/utils";

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

// CSV Helper Functions
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

  // ---------- sort ----------
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

  // ---------- Selection model ----------
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [selectAllMatching, setSelectAllMatching] = React.useState(false);
  const [excluded, setExcluded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setSelected({});
    setSelectAllMatching(false);
    setExcluded({});
  }, [args]);

  const isRowChecked = (id: string) =>
    selectAllMatching ? !excluded[id] : !!selected[id];

  const setRowChecked = (id: string, checked: boolean) => {
    if (selectAllMatching) setExcluded((prev) => ({ ...prev, [id]: !checked }));
    else setSelected((prev) => ({ ...prev, [id]: checked }));
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

  // ---------- Undo Banner ----------
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

  // ---------- Receipt & Bulk Dialogs ----------
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [receiptTxn, setReceiptTxn] = React.useState<Txn | null>(null);
  const openReceipt = (t: Txn) => {
    setReceiptTxn(t);
    setReceiptOpen(true);
  };

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

  const doBulkDelete = async () => {
    if (selectAllMatching) {
      const excludeIds = Object.keys(excluded).filter((k) => excluded[k]);
      await softDeleteByFilter({
        args: { ...args, page: 1 },
        excludeIds,
      }).unwrap();
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

  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false);

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/50 shadow-sm ring-1 ring-border"
            onClick={() => nav(ROUTES.DASHBOARD)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Expenses
            </h1>
          </div>
        </div>

        {/* Global Action Bar: Scrollable on mobile */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-none sm:scrollbar-thin sm:w-auto">
          <div className="flex w-max items-center gap-2">
            {isFetching && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold animate-pulse whitespace-nowrap">
                Syncing...
              </div>
            )}
            <Button
              variant="secondary"
              className="rounded-2xl whitespace-nowrap"
              onClick={() => nav(ROUTES.EXPENSES_TRASH)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> See Trash
            </Button>
            <Button
              className="rounded-2xl whitespace-nowrap shadow-sm"
              onClick={exportThisPage}
              disabled={rows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Export Page
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
        <div className="flex items-center justify-between gap-2 rounded-2xl border bg-background p-4 shadow-sm animate-in slide-in-from-top-2">
          <p className="text-sm font-medium">
            Deleted {lastDeletedIds.length} expense(s).{" "}
            <span className="text-muted-foreground">(Soft-deleted)</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={undoDelete}
            disabled={restoreState.isLoading}
          >
            <Undo2 className="mr-2 h-4 w-4" /> Undo
          </Button>
        </div>
      )}

      {/* Filters Card */}
      <Card className="rounded-[2.5rem] border-0 shadow-lg ring-1 ring-black/5 bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Filter className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold">Filters</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timeframe Scrollable Pills */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-none sm:scrollbar-thin">
            <div className="flex w-max items-center gap-2">
              {(["month", "quarter", "year", "custom"] as Timeframe[]).map(
                (t) => (
                  <Button
                    key={t}
                    variant={timeframe === t ? "default" : "secondary"}
                    className="rounded-2xl whitespace-nowrap"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {timeframe === "month" && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Month
                </p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
            )}
            {/* Other timeframe inputs (quarter, year, custom) would go here following the same pattern */}

            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Search
              </p>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Swiggy, Rent..."
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Category
                </p>
                <select
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
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
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Method
                </p>
                <select
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
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
          </div>
        </CardContent>
      </Card>

      {/* List / Table Card */}
      <Card className="rounded-[2.5rem] border-0 shadow-xl ring-1 ring-black/5 bg-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  All Expenses
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="mt-0.5 rounded-lg text-[10px] font-bold"
                >
                  {total} RECORDS
                </Badge>
              </div>
            </div>

            {/* Bulk Actions: Scrollable on mobile */}
            {selectedCount > 0 && (
              <div className="w-full overflow-x-auto pb-1 scrollbar-none sm:w-auto">
                <div className="flex w-max items-center gap-2">
                  <Badge
                    variant="default"
                    className="rounded-xl whitespace-nowrap bg-primary px-3 py-1"
                  >
                    Selected: {selectedCount}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl whitespace-nowrap"
                    onClick={() => {
                      setBulkCategory(ALL);
                      setBulkMethod(ALL);
                      setBulkEditOpen(true);
                    }}
                  >
                    Bulk Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl whitespace-nowrap"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl whitespace-nowrap"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground animate-pulse font-medium">
              Loading transactions...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-medium">
              No expenses found for this filter.
            </div>
          ) : (
            <div className="space-y-4">
              {/* --- DESKTOP VIEW: Clean Table --- */}
              <div className="hidden sm:block overflow-x-auto max-w-full min-w-0 scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-3 pr-2 text-left w-10">
                        <Checkbox
                          checked={
                            allOnPageChecked
                              ? true
                              : someOnPageChecked
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={toggleSelectAllOnPage}
                        />
                      </th>
                      <th className="py-3 text-left">
                        <button
                          className="inline-flex items-center font-bold uppercase tracking-tighter text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleSort("title")}
                        >
                          Title <SortIcon f="title" />
                        </button>
                      </th>
                      <th className="py-3 text-left">
                        <button
                          className="inline-flex items-center font-bold uppercase tracking-tighter text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleSort("date")}
                        >
                          Date <SortIcon f="date" />
                        </button>
                      </th>
                      <th className="py-3 text-left font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">
                        Category
                      </th>
                      <th className="py-3 text-left font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">
                        Method
                      </th>
                      <th className="py-3 text-right">
                        <button
                          className="inline-flex items-center font-bold uppercase tracking-tighter text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleSort("amount")}
                        >
                          Amount <SortIcon f="amount" />
                        </button>
                      </th>
                      <th className="py-3 text-right font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((t) => (
                      <tr
                        key={t.id}
                        className={cn(
                          "group transition-colors hover:bg-muted/30",
                          isRowChecked(t.id) && "bg-primary/5",
                        )}
                      >
                        <td className="py-4 pr-2 align-middle">
                          <Checkbox
                            checked={isRowChecked(t.id)}
                            onCheckedChange={(v) => setRowChecked(t.id, !!v)}
                          />
                        </td>
                        <td className="py-4 align-middle font-bold text-foreground">
                          {t.title}
                        </td>
                        <td className="py-4 align-middle text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.date), "dd MMM, hh:mm a")}
                        </td>
                        <td className="py-4 align-middle">
                          <select
                            className="h-8 rounded-lg border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
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
                        <td className="py-4 align-middle">
                          <Badge
                            variant="outline"
                            className="font-medium whitespace-nowrap text-[10px]"
                          >
                            {t.paymentMethod}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle text-right font-black text-foreground">
                          - {formatINR(t.amount)}
                        </td>
                        <td className="py-4 align-middle text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all"
                            onClick={() => openReceipt(t)}
                            disabled={!t.receiptUrl}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- MOBILE VIEW: Interactive Cards --- */}
              <div className="flex flex-col gap-3 sm:hidden p-4 pt-0">
                {rows.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-[1.5rem] border p-4 transition-all shadow-sm",
                      isRowChecked(t.id)
                        ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                        : "bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isRowChecked(t.id)}
                          onCheckedChange={(v) => setRowChecked(t.id, !!v)}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <p className="font-black truncate text-foreground text-sm uppercase tracking-tight">
                            {t.title}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">
                            {format(new Date(t.date), "dd MMM, hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-foreground text-sm leading-none">
                          -{formatINR(t.amount)}
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-[9px] font-black uppercase tracking-tighter h-5 px-1.5"
                        >
                          {t.paymentMethod}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                      <select
                        className="h-9 flex-1 rounded-xl border bg-background px-3 text-[11px] font-bold focus:ring-2 focus:ring-primary outline-none"
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
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 rounded-xl px-4 text-xs font-bold"
                        onClick={() => openReceipt(t)}
                        disabled={!t.receiptUrl}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" /> Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-6 border-t border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center sm:text-left">
              Page {page} <span className="opacity-50 mx-1">/</span>{" "}
              {totalPages}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl px-6 font-bold"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl px-6 font-bold"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Dialogs are unchanged from previous logic */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="rounded-[2rem] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Bulk Edit ({selectedCount})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Change Category
              </p>
              <select
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Change Method
              </p>
              <select
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                value={bulkMethod}
                onChange={(e) => setBulkMethod(e.target.value)}
              >
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => setBulkEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-bold px-8"
              onClick={applyBulkEdit}
              disabled={busy}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">
              Delete {selectedCount} items?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              These will be moved to trash. You can restore them for a few
              seconds using the undo banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted">
              Keep Them
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 px-8"
              onClick={doBulkDelete}
              disabled={busy}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-[600px] overflow-hidden p-0 border-none bg-background shadow-2xl">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Receipt Details
                </DialogTitle>
              </DialogHeader>
              <Badge className="rounded-lg font-black uppercase tracking-tighter">
                {receiptTxn?.category}
              </Badge>
            </div>

            {receiptTxn?.receiptUrl ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-3xl bg-muted/30 p-6 ring-1 ring-border">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Total Amount
                    </p>
                    <p className="text-xl font-black text-foreground">
                      {formatINR(receiptTxn.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Date Paid
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {format(new Date(receiptTxn.date), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-[2rem] ring-1 ring-border shadow-inner bg-muted/20">
                  <img
                    src={receiptTxn.receiptUrl}
                    alt="Expense Receipt"
                    className="w-full h-auto object-contain max-h-[60vh] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center font-bold text-muted-foreground opacity-50 uppercase tracking-widest italic">
                No image data attached.
              </div>
            )}
          </div>
          <div className="bg-muted/50 p-4 flex justify-end">
            <Button
              variant="secondary"
              className="rounded-xl font-bold px-8 shadow-sm"
              onClick={() => setReceiptOpen(false)}
            >
              Close View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
