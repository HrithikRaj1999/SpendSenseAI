import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import * as React from "react";

export function BudgetsSettingsPage() {
  const [rollover, setRollover] = React.useState(true);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border p-3">
            <div>
              <div className="text-sm font-medium">Rollover unused budget</div>
              <div className="text-xs text-muted-foreground">
                Carry unused amount to next month (if enabled).
              </div>
            </div>
            <Switch checked={rollover} onCheckedChange={setRollover} />
          </div>

          <div className="rounded-2xl border p-3 text-sm text-muted-foreground">
            Add more settings here:
            fiscal month start day, alert delivery options, strict mode defaults,
            and goal allocation priorities.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
