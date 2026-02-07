import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetMode } from "../../utils/types";
import { Switch } from "@radix-ui/react-switch";
import { ReactNode, useEffect, useMemo, useState } from "react";

type CreatePayload = {
  month: string;
  totalLimit: number;
  mode: BudgetMode;
  rolloverUnused: boolean;
};

type Props = {
  trigger?: ReactNode;

  // controlled (preferred)
  open?: boolean;
  onOpenChange?: (v: boolean) => void;

  defaultMonth?: string;

  loading?: boolean;
  onCreate?: (payload: CreatePayload) => Promise<void> | void;
};

function clampInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

export function CreateFirstBudgetModal({
  trigger,
  open,
  onOpenChange,
  defaultMonth,
  loading,
  onCreate,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  const [month, setMonth] = useState(defaultMonth ?? "2026-01");
  const [limit, setLimit] = useState("50000");
  const [mode, setMode] = useState<BudgetMode>("FLEXIBLE");
  const [rolloverUnused, setRolloverUnused] = useState(false);

  // keep month synced when parent changes (e.g., month picker)
  useEffect(() => {
    if (defaultMonth) setMonth(defaultMonth);
  }, [defaultMonth]);

  const limitNum = useMemo(() => {
    const n = Number(limit.replace(/,/g, ""));
    return clampInt(n);
  }, [limit]);

  const canSubmit = limitNum > 0 && !loading;

  async function handleCreate() {
    if (!onCreate) {
      // if used standalone without handler, just close
      setOpen(false);
      return;
    }

    if (!limitNum) return;

    await onCreate({
      month,
      totalLimit: limitNum,
      mode,
      rolloverUnused,
    });

    // parent typically closes it, but safe
    setOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {defaultMonth ? `Create Budget (${month})` : "Create Budget"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month (read-only for now; parent drives it) */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Month</div>
            <Input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-2xl"
              placeholder="YYYY-MM"
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">
              Format: YYYY-MM (example: 2026-01)
            </div>
          </div>

          {/* Total limit */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Monthly total limit (₹)</div>
            <Input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="rounded-2xl"
              inputMode="numeric"
              placeholder="50000"
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">
              Parsed as: ₹{limitNum.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Mode</div>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as BudgetMode)}
              disabled={loading}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRICT">Strict</SelectItem>
                <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rollover */}
          <div className="flex items-center justify-between rounded-2xl border p-3">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Rollover unused amount</div>
              <div className="text-xs text-muted-foreground">
                Carry forward remaining budget to next month (demo).
              </div>
            </div>
            <Switch
              checked={rolloverUnused}
              onCheckedChange={setRolloverUnused}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              className="rounded-2xl"
              onClick={handleCreate}
              disabled={!canSubmit}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
