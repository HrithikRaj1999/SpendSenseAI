import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { GuardrailRule } from "../../utils/types";

export function CreateGuardrailModal({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<GuardrailRule["type"]>("CONFIRM_ON_EXCEED");
  const [value, setValue] = React.useState("0");

  const needsValue = type === "WEEKLY_CAP";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="rounded-2xl">New Guardrail</Button>}
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create guardrail</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Type</div>
            <Select value={type} onValueChange={(v) => setType(v as GuardrailRule["type"])}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRM_ON_EXCEED">Confirm on exceed</SelectItem>
                <SelectItem value="SOFT_LOCK_ON_EXCEED">Soft lock on exceed</SelectItem>
                <SelectItem value="WARN_BEFORE_SPEND">Warn before spend</SelectItem>
                <SelectItem value="WEEKLY_CAP">Weekly cap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {needsValue ? (
            <div className="space-y-1">
              <div className="text-sm font-medium">Weekly cap (₹)</div>
              <Input className="rounded-2xl" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-2xl" onClick={() => setOpen(false)}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
