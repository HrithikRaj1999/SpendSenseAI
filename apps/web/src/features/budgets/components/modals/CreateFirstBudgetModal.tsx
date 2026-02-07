import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BudgetMode } from "../../utils/types";

export function CreateFirstBudgetModal({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [limit, setLimit] = React.useState("50000");
  const [mode, setMode] = React.useState<BudgetMode>("FLEXIBLE");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="rounded-2xl">Create First Budget</Button>}
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Monthly total limit (₹)</div>
            <Input value={limit} onChange={(e) => setLimit(e.target.value)} className="rounded-2xl" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Mode</div>
            <Select value={mode} onValueChange={(v) => setMode(v as BudgetMode)}>
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
