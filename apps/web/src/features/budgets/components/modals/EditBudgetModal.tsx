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
import { Switch } from "@/components/ui/switch";
import { ReactNode, useEffect, useMemo, useState } from "react";

type EditPayload = {
  totalLimit: number;
  mode: BudgetMode;
  rolloverUnused: boolean;
};

type Props = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;

  month: string;
  currentLimit: number;
  currentMode: BudgetMode;
  currentRollover: boolean;

  loading?: boolean;
  onEdit: (payload: EditPayload) => Promise<void> | void;
};

function clampInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

export function EditBudgetModal({
  trigger,
  open,
  onOpenChange,
  month,
  currentLimit,
  currentMode,
  currentRollover,
  loading,
  onEdit,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  const [limit, setLimit] = useState(String(currentLimit));
  const [mode, setMode] = useState<BudgetMode>(currentMode);
  const [rolloverUnused, setRolloverUnused] = useState(currentRollover);

  // Sync when opening or props change
  useEffect(() => {
    if (isOpen) {
      setLimit(String(currentLimit));
      setMode(currentMode);
      setRolloverUnused(currentRollover);
    }
  }, [isOpen, currentLimit, currentMode, currentRollover]);

  const limitNum = useMemo(() => {
    const n = Number(limit.replace(/,/g, ""));
    return clampInt(n);
  }, [limit]);

  const canSubmit = limitNum > 0 && !loading;

  async function handleEdit() {
    if (!limitNum) return;

    await onEdit({
      totalLimit: limitNum,
      mode,
      rolloverUnused,
    });
    setOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="rounded-3xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget ({month})</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Modify your budget settings below.
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Total limit */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Monthly total limit (₹)</div>
            <Input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="rounded-2xl h-12 text-lg"
              inputMode="numeric"
              placeholder="50000"
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">
              Update your spending limit for this month.
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Budget Mode</div>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as BudgetMode)}
              disabled={loading}
            >
              <SelectTrigger className="rounded-2xl h-10">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRICT">Strict (Hard Stop)</SelectItem>
                <SelectItem value="FLEXIBLE">
                  Flexible (Notifications)
                </SelectItem>
                <SelectItem value="SAVINGS">Savings First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rollover */}
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Rollover Unused</div>
              <div className="text-xs text-muted-foreground">
                Carry forward savings to next month
              </div>
            </div>
            <Switch
              checked={rolloverUnused}
              onCheckedChange={setRolloverUnused}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="rounded-2xl px-6"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              className="rounded-2xl px-6"
              onClick={handleEdit}
              disabled={!canSubmit}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
