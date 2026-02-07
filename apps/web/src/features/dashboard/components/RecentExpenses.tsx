import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatINR } from "@/lib/utils";
import { RecentExpense } from "../../dashboard/utils/types";
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";

const getCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes("shop")) return ShoppingBag;
  if (c.includes("food")) return Coffee;
  if (c.includes("travel") || c.includes("fuel") || c.includes("transport"))
    return Car;
  if (c.includes("home") || c.includes("rent")) return Home;
  return Zap;
};

type Props = { data: RecentExpense[] };

export const RecentExpenses = React.memo(function RecentExpenses({
  data,
}: Props) {
  const nav = useNavigate();
  return (
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Receipt size={20} />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            Recent Transactions
          </CardTitle>
        </div>

        <button
          onClick={() => nav(ROUTES.TRANSACTIONS)}
          className="hidden sm:flex items-center text-xs font-medium text-primary hover:underline"
        >
          View All <ArrowUpRight className="ml-1 h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-2">
        {data.map((e, i) => {
          const Icon = getCategoryIcon(e.category);

          return (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/40"
            >
              {/* left */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                    i % 2 === 0
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-orange-100 text-orange-600",
                  ].join(" ")}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {e.title}
                  </p>

                  {/* Mobile: stack meta */}
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {format(new Date(e.date), "dd MMM, hh:mm a")} • {e.category}
                  </p>

                  {/* Mobile method */}
                  <div className="mt-1 sm:hidden">
                    <Badge variant="secondary" className="text-[10px]">
                      {e.paymentMethod}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* right */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-sm font-bold text-foreground">
                  - {formatINR(e.amount)}
                </span>

                {/* Desktop method */}
                <div className="hidden sm:block">
                  <Badge variant="secondary" className="text-xs">
                    {e.paymentMethod}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
