import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Repeat, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useGetRecurringQuery } from "../api/recurringApi";
import { format } from "date-fns";
import { formatINR } from "@/lib/utils";

export default function RecurringPage() {
  const nav = useNavigate();
  const { data, isLoading } = useGetRecurringQuery();
  const rows = data ?? [];

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
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
              Recurring
            </h1>
            <p className="text-sm text-muted-foreground">
              Subscriptions & repeat payments detected automatically.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="rounded-xl">
          <Repeat className="mr-2 h-4 w-4" />
          {rows.length} detected
        </Badge>
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">
            Recurring Payments
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No recurring patterns found yet.
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} • {r.paymentMethod} • {r.cadence}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Next due: {format(new Date(r.nextDue), "dd MMM yyyy")}
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-sm font-bold">
                    ~ {formatINR(r.avgAmount)} /{" "}
                    {r.cadence === "Monthly" ? "mo" : "wk"}
                  </span>
                  <Button variant="secondary" className="rounded-2xl" disabled>
                    Manage (next)
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
