import { Switch } from "@/components/ui/switch";
import type { GuardrailRule } from "../../utils/types";

const LABEL: Record<GuardrailRule["type"], string> = {
  CONFIRM_ON_EXCEED: "Confirm when budget exceeded",
  SOFT_LOCK_ON_EXCEED: "Soft lock when exceeded",
  WARN_BEFORE_SPEND: "Warn before spending",
  WEEKLY_CAP: "Weekly cap",
};

export function GuardrailsList({
  items,
  onToggle,
}: {
  items: GuardrailRule[];
  onToggle?: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((g) => (
        <div key={g.id} className="flex items-center justify-between rounded-2xl border p-3">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">
              {LABEL[g.type]}
              {g.category ? ` • ${g.category}` : ""}
            </div>
            {typeof g.value === "number" ? (
              <div className="text-xs text-muted-foreground">Value: ₹{g.value}</div>
            ) : (
              <div className="text-xs text-muted-foreground">Value: —</div>
            )}
          </div>
          <Switch checked={g.enabled} onCheckedChange={(v) => onToggle?.(g.id, v)} />
        </div>
      ))}
    </div>
  );
}
