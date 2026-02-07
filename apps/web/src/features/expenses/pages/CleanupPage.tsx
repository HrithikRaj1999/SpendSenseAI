import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Trash2, Merge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useGetDuplicatesQuery } from "../api/cleanupApi";
import { useSoftDeleteExpensesMutation } from "../api/expensesApi";
import { format } from "date-fns";
import { formatINR } from "@/lib/utils";

export default function CleanupPage() {
  const nav = useNavigate();
  const { data, isLoading } = useGetDuplicatesQuery();
  const [softDelete] = useSoftDeleteExpensesMutation();

  const pairs = data ?? [];

  async function deleteOne(id: string) {
    await softDelete([id]).unwrap();
  }

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
              Cleanup
            </h1>
            <p className="text-sm text-muted-foreground">
              Detect duplicates and fix messy imports.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="rounded-xl">
          <Sparkles className="mr-2 h-4 w-4" />
          {pairs.length} suggestions
        </Badge>
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">
            Potential Duplicates
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : pairs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No duplicates detected. Your data looks clean.
            </div>
          ) : (
            pairs.map((p, idx) => (
              <div key={idx} className="rounded-2xl border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">
                    Confidence: {(p.confidence * 100).toFixed(0)}%
                  </div>
                  <Badge variant="secondary" className="rounded-xl">
                    {p.reason}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[p.a, p.b].map((e) => (
                    <div key={e.id} className="rounded-2xl bg-muted/30 p-3">
                      <p className="text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(e.date), "dd MMM, hh:mm a")} •{" "}
                        {e.category}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold">
                          - {formatINR(e.amount)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {e.paymentMethod}
                        </Badge>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => deleteOne(e.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-xl"
                          disabled
                        >
                          <Merge className="mr-2 h-4 w-4" />
                          Merge (next)
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
