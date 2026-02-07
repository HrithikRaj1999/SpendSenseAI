import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, Trash2, RotateCcw, Search, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { formatINR } from "@/lib/utils";

import {
  useGetTrashQuery,
  useRestoreExpensesMutation,
  useHardDeleteExpensesMutation,
  useEmptyTrashMutation,
} from "../api/expensesApi";
import type { Txn } from "@/features/expenses/types";

export default function TrashPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 25;

  React.useEffect(() => setPage(1), [search]);

  const { data, isLoading, isFetching } = useGetTrashQuery({
    search,
    page,
    limit,
  });
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // selection
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => setSelected({}), [page, search, total]);

  const selectedIds = React.useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected],
  );

  const allOnPageSelected =
    rows.length > 0 && rows.every((r) => selected[r.id]);
  const someOnPageSelected =
    rows.some((r) => selected[r.id]) && !allOnPageSelected;

  const toggleAll = () => {
    const next = !allOnPageSelected;
    setSelected((prev) => {
      const out = { ...prev };
      rows.forEach((r) => (out[r.id] = next));
      return out;
    });
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  // mutations
  const [restoreExpenses, restoreState] = useRestoreExpensesMutation();
  const [hardDelete, hardDeleteState] = useHardDeleteExpensesMutation();
  const [emptyTrash, emptyState] = useEmptyTrashMutation();

  // dialogs
  const [confirmHardDeleteOpen, setConfirmHardDeleteOpen] =
    React.useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = React.useState(false);

  const busy =
    isFetching ||
    restoreState.isLoading ||
    hardDeleteState.isLoading ||
    emptyState.isLoading;

  const restoreSelected = async () => {
    if (selectedIds.length === 0) return;
    await restoreExpenses({ ids: selectedIds }).unwrap();
    setSelected({});
  };

  const hardDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await hardDelete({ ids: selectedIds }).unwrap();
    setSelected({});
    setConfirmHardDeleteOpen(false);
  };

  const emptyAll = async () => {
    await emptyTrash().unwrap();
    setSelected({});
    setConfirmEmptyOpen(false);
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => nav(ROUTES.EXPENSES ?? ROUTES.DASHBOARD)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trash
            </h1>
            <p className="text-sm text-muted-foreground">
              Restore items anytime — or permanently delete them.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFetching && (
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
              Syncing...
            </span>
          )}

          <Button
            variant="destructive"
            className="rounded-2xl"
            onClick={() => setConfirmEmptyOpen(true)}
            disabled={busy || total === 0}
          >
            <Flame className="mr-2 h-4 w-4" />
            Empty Trash
          </Button>
        </div>
      </div>

      {/* Search + Bulk actions */}
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold text-foreground">
              Deleted Expenses
            </CardTitle>
            <Badge variant="secondary" className="rounded-xl">
              {total} records
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in trash..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={restoreSelected}
                disabled={busy || selectedIds.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore ({selectedIds.length})
              </Button>

              <Button
                variant="destructive"
                className="rounded-2xl"
                onClick={() => setConfirmHardDeleteOpen(true)}
                disabled={busy || selectedIds.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Forever ({selectedIds.length})
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Trash is empty.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-2 text-left">
                      <Checkbox
                        checked={
                          allOnPageSelected
                            ? true
                            : someOnPageSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="py-2 text-left">Title</th>
                    <th className="py-2 text-left">Deleted At</th>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-left">Method</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t: Txn) => (
                    <tr
                      key={t.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="py-3 pr-2 align-top">
                        <Checkbox
                          checked={!!selected[t.id]}
                          onCheckedChange={() => toggleOne(t.id)}
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
                        {t.deletedAt
                          ? format(
                              new Date(t.deletedAt),
                              "dd MMM yyyy, hh:mm a",
                            )
                          : "—"}
                      </td>
                      <td className="py-3 align-top">{t.category}</td>
                      <td className="py-3 align-top">{t.paymentMethod}</td>
                      <td className="py-3 align-top text-right font-bold">
                        - {formatINR(t.amount)}
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

      {/* Confirm hard delete */}
      <AlertDialog
        open={confirmHardDeleteOpen}
        onOpenChange={setConfirmHardDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete forever?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {selectedIds.length} expense(s). This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl"
              onClick={hardDeleteSelected}
              disabled={busy}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm empty trash */}
      <AlertDialog open={confirmEmptyOpen} onOpenChange={setConfirmEmptyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all {total} deleted expenses. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl"
              onClick={emptyAll}
              disabled={busy}
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
