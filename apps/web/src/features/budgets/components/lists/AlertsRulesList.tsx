import { Switch } from "@/components/ui/switch";
import type { AlertRule } from "../../utils/types";

export function AlertsRulesList({
  items,
  onToggle,
}: {
  items: AlertRule[];
  onToggle?: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl border p-3">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">
              {r.scope === "TOTAL" ? "Total budget" : r.category ?? "Category"} • {r.threshold}%
            </div>
            <div className="text-xs text-muted-foreground">
              Channel: {r.channel === "IN_APP" ? "In-app" : "Email"}
            </div>
          </div>
          <Switch checked={r.enabled} onCheckedChange={(v) => onToggle?.(r.id, v)} />
        </div>
      ))}
    </div>
  );
}
