import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn, formatINR } from "@/lib/utils";
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
    <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Receipt size={20} />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            Recent Transactions
          </CardTitle>
        </div>

        <button
          onClick={() => nav(ROUTES.EXPENSES)}
          className="flex items-center text-xs font-medium text-primary hover:underline"
        >
          View All <ArrowUpRight className="ml-1 h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No recent transactions found.
          </div>
        ) : (
          <>
            {/* --- DESKTOP VIEW: Internal Scroll Table --- */}
            {/* max-w-full and min-w-0 prevent the card from expanding the page width */}
            <div className="hidden sm:block overflow-x-auto max-w-full min-w-0 scrollbar-thin scrollbar-thumb-muted-foreground/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                      Transaction
                    </th>
                    <th className="pb-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                      Category
                    </th>
                    <th className="pb-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                      Method
                    </th>
                    <th className="pb-3 text-right font-semibold text-muted-foreground whitespace-nowrap">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.map((e) => (
                    <tr
                      key={e.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {React.createElement(getCategoryIcon(e.category), {
                              size: 16,
                            })}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[150px] lg:max-w-[250px]">
                              {e.title}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(e.date), "dd MMM, hh:mm a")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground whitespace-nowrap px-2">
                        {e.category}
                      </td>
                      <td className="py-4 whitespace-nowrap px-2">
                        <Badge variant="secondary" className="font-normal">
                          {e.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-bold text-foreground whitespace-nowrap">
                        - {formatINR(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE VIEW: Compact Cards --- */}
            <div className="flex flex-col gap-1 sm:hidden p-4 pt-0">
              {data.map((e, i) => {
                const Icon = getCategoryIcon(e.category);
                return (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                          i % 2 === 0
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-orange-100 text-orange-600",
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {e.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {format(new Date(e.date), "dd MMM")} • {e.category}
                        </p>
                        <div className="mt-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 h-4"
                          >
                            {e.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-sm font-bold text-foreground">
                        - {formatINR(e.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
