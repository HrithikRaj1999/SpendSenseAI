import * as React from "react";
import { Outlet, useSearchParams } from "react-router-dom";

import { BudgetsSubnav } from "../components/nav/BudgetsSubnav";
import { BudgetMonthPicker } from "../components/nav/BudgetMonthPicker";
import { CreateFirstBudgetModal } from "../components/modals/CreateFirstBudgetModal";
import { EditBudgetModal } from "../components/modals/EditBudgetModal";

import {
  useCreateMonthBudgetMutation,
  useGetBudgetByMonthQuery,
  useListBudgetMonthsQuery,
  useUpdateBudgetMutation,
  useCloneBudgetMutation,
  useResetBudgetMutation,
} from "../api/budgetsApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BudgetOutletCtx = {
  selectedMonth: string;
};

export function BudgetsLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: monthsData } = useListBudgetMonthsQuery();
  const monthOptions = monthsData?.months ?? [];

  // Determine selectedMonth from URL or fallback
  // Fallback order: URL -> Latest Month -> Current Month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const latestMonth = monthOptions.length > 0 ? monthOptions[0] : currentMonth; // assuming sorted desc in API
  const urlMonth = searchParams.get("month");

  // We don't need local state for selectedMonth, we can derive it?
  // But we want to set it if missing.

  // Actually, let's keep it simple: URL is source of truth.
  // If URL missing, we redirect/replace URL to default.

  const selectedMonth = urlMonth || latestMonth;

  // Effect to set URL if missing
  React.useEffect(() => {
    if (!urlMonth) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("month", selectedMonth);
          return next;
        },
        { replace: true },
      );
    }
  }, [urlMonth, selectedMonth, setSearchParams]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  // Pass separate arg object to query hook
  const { data, isLoading, isFetching } = useGetBudgetByMonthQuery(
    { month: selectedMonth },
    { skip: !selectedMonth },
  );

  const hasBudget = !!data?.budget;

  const [createMonthBudget, createState] = useCreateMonthBudgetMutation();
  const [updateBudget, updateState] = useUpdateBudgetMutation();
  const [cloneBudget, cloneState] = useCloneBudgetMutation();
  const [resetBudget, resetState] = useResetBudgetMutation();

  const busy =
    isLoading ||
    isFetching ||
    createState.isLoading ||
    updateState.isLoading ||
    cloneState.isLoading ||
    resetState.isLoading;

  // ---------- actions ----------
  async function onQuickEditBudget() {
    if (!data?.budget) return;
    setEditOpen(true);
  }

  async function onClonePrevMonth() {
    // Clone to next month logic
    const [y, m] = selectedMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextMonthISO = nextDate.toISOString().slice(0, 7);

    const toMonth = prompt("Clone to month (YYYY-MM):", nextMonthISO);
    if (!toMonth) return;

    await cloneBudget({
      fromMonth: selectedMonth,
      toMonth,
    }).unwrap();

    // Switch to new month
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("month", toMonth);
        return next;
      },
      { replace: false },
    );
  }

  async function onResetMonthTemplate() {
    if (!confirm("Reset budget to defaults?")) return;
    await resetBudget({
      month: selectedMonth,
    }).unwrap();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Budgets
          </h1>
          <p className="text-sm text-muted-foreground">
            Limits, alerts, AI forecasts, and what-if simulations.
          </p>
        </div>

        {/* Action Bar: Scrollable on mobile, flex-wrap on desktop */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-none sm:scrollbar-thin">
          <div className="flex w-max items-center gap-2">
            {/* Month Picker stays fixed at start of scroll */}
            <BudgetMonthPicker
              value={selectedMonth}
              onChange={(m) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("month", m);
                  return next;
                });
              }}
              options={monthOptions}
              disabled={busy}
            />

            <div className="h-6 w-px bg-border mx-1" />

            <Button
              className="rounded-2xl whitespace-nowrap shadow-sm"
              onClick={() => setCreateOpen(true)}
              disabled={busy}
            >
              {hasBudget ? "New Month Budget" : "Create First Budget"}
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl whitespace-nowrap"
              onClick={onQuickEditBudget}
              disabled={!hasBudget || busy}
            >
              Edit Budget
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl whitespace-nowrap"
              onClick={onClonePrevMonth}
              disabled={!hasBudget || busy}
            >
              Clone Month
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl whitespace-nowrap"
              onClick={onResetMonthTemplate}
              disabled={!hasBudget || busy}
            >
              Reset
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl whitespace-nowrap"
              disabled={busy}
              onClick={() => setCreateOpen(true)}
            >
              Use Smart Template
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-navigation - Already handles its own scrolling */}
      <BudgetsSubnav />

      {/* Modal */}
      <CreateFirstBudgetModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultMonth={selectedMonth}
        loading={createState.isLoading}
        onCreate={async (payload) => {
          await createMonthBudget(payload).unwrap();
          // Month sync handled by UI effect or mutation success?
          // If we create for current selected month, it just appears.
          // If we create for diff month, we might want to switch.
          if (payload.month !== selectedMonth) {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("month", payload.month);
              return next;
            });
          }
          setCreateOpen(false);
        }}
      />

      <EditBudgetModal
        open={editOpen}
        onOpenChange={setEditOpen}
        month={selectedMonth}
        currentLimit={data?.budget?.totalLimit ?? 0}
        currentMode={data?.budget?.mode ?? "FLEXIBLE"}
        currentRollover={data?.budget?.rolloverUnused ?? false}
        loading={updateState.isLoading}
        onEdit={async (payload) => {
          await updateBudget({
            month: selectedMonth,
            patch: payload,
          }).unwrap();
          setEditOpen(false);
        }}
      />

      {/* Content Area */}
      <div className="min-h-[400px]">
        {!hasBudget ? (
          <Card className="rounded-[2rem] border-none bg-muted/30 shadow-inner">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
                <span className="text-2xl">📊</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  No budget set for {selectedMonth}
                </h3>
                <p className="max-w-[300px] text-sm text-muted-foreground leading-relaxed">
                  Create a budget to unlock category limits, alerts, forecasts,
                  and AI insights.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button
                  className="rounded-2xl px-6"
                  onClick={() => setCreateOpen(true)}
                  disabled={busy}
                >
                  Create Budget
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl px-6 bg-background"
                  onClick={() => setCreateOpen(true)}
                  disabled={busy}
                >
                  Use Smart Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <Outlet context={{ selectedMonth } satisfies BudgetOutletCtx} />
          </div>
        )}
      </div>
    </div>
  );
}
