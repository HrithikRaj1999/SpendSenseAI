import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { ArrowLeft, Trash2, Tag, CheckSquare } from "lucide-react";

import {
  useGetExpensesQuery,
  useSoftDeleteExpensesMutation,
} from "../api/expensesApi";
import { format } from "date-fns";
import { formatINR } from "@/lib/utils";

export default function BulkActionsPage() {
  const nav = useNavigate();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [softDelete, { isLoading: deleting }] = useSoftDeleteExpensesMutation();

  const { data, isFetching } = useGetExpensesQuery({
    timeframe: "month",
    month: "2026-02",
    page: 1,
    limit: 50,
    category: "All",
    paymentMethod: "All",
    search: "",
    sortField: "date",
    sortOrder: "desc",
  } as any);

  const rows = data?.rows ?? [];
  const totalSelected = Object.values(selected).filter(Boolean).length;

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.id] = true;
    setSelected(next);
  }

  function clearAll() {
    setSelected({});
  }

  async function bulkDelete() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return;
    await softDelete({ ids }).unwrap();
    clearAll();
  }

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
              Bulk Actions
            </h1>
            <p className="text-sm text-muted-foreground">
              Select multiple expenses and apply actions together.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFetching && (
            <Badge variant="secondary" className="rounded-xl">
              Syncing…
            </Badge>
          )}
          <Badge variant="secondary" className="rounded-xl">
            <CheckSquare className="mr-2 h-4 w-4" />
            {totalSelected} selected
          </Badge>
        </div>
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold">Actions</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={selectAll}
                disabled={rows.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={clearAll}
                disabled={totalSelected === 0}
              >
                Clear
              </Button>
              <Button
                className="rounded-2xl"
                onClick={bulkDelete}
                disabled={totalSelected === 0 || deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>

              <Button variant="secondary" className="rounded-2xl" disabled>
                <Tag className="mr-2 h-4 w-4" />
                Bulk Categorize (next)
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {rows.map((e) => (
            <label
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={!!selected[e.id]}
                  onChange={() => toggle(e.id)}
                />
                <div>
                  <p className="text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(e.date), "dd MMM, hh:mm a")} • {e.category}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold">
                  - {formatINR(e.amount)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {e.paymentMethod}
                </Badge>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
