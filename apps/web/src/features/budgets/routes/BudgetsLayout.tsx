import * as React from "react";
import { Outlet } from "react-router-dom";

import { BudgetsSubnav } from "../components/nav/BudgetsSubnav";
import { BudgetMonthPicker } from "../components/nav/BudgetMonthPicker";
import { CreateFirstBudgetModal } from "../components/modals/CreateFirstBudgetModal";

import {
  useCreateMonthBudgetMutation,
  useGetBudgetByMonthQuery,
  useListBudgetMonthsQuery,
  useUpdateBudgetMutation,
} from "../api/budgetsApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BudgetOutletCtx = {
  selectedMonth: string;
};

export function BudgetsLayout() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    () => "2026-01",
  );
  const { data: monthsData } = useListBudgetMonthsQuery();
  const monthOptions = monthsData?.months ?? [];
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data, isLoading, isFetching, refetch } =
    useGetBudgetByMonthQuery(selectedMonth);
  const hasBudget = !!data?.budget;

  const [createMonthBudget, createState] = useCreateMonthBudgetMutation();
  const [updateBudget, updateState] = useUpdateBudgetMutation();

  const busy =
    isLoading || isFetching || createState.isLoading || updateState.isLoading;

  // ---------- actions ----------
  async function onQuickEditBudget() {
    if (!data?.budget) return;
    await updateBudget({
      month: selectedMonth,
      patch: { totalLimit: data.budget.totalLimit + 5000 },
    } as any).unwrap();
    refetch();
  }

  async function onClonePrevMonth() {
    await createMonthBudget({
      month: selectedMonth,
      totalLimit: data?.budget?.totalLimit ?? 60000,
      mode: data?.budget?.mode ?? "FLEXIBLE",
      rolloverUnused: data?.budget?.rolloverUnused ?? false,
    } as any).unwrap();
    refetch();
  }

  async function onResetMonthTemplate() {
    await createMonthBudget({
      month: selectedMonth,
      totalLimit: 60000,
      mode: "FLEXIBLE",
      rolloverUnused: false,
    } as any).unwrap();
    refetch();
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
              onChange={setSelectedMonth}
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
              disabled={busy}
            >
              Clone Month
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl whitespace-nowrap"
              onClick={onResetMonthTemplate}
              disabled={busy}
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
          setSelectedMonth(payload.month);
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
                <h3 className="text-lg font-semibold">No budget set yet</h3>
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
