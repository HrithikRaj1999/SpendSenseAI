import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function CreateGoalModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("Emergency Fund");
  const [amount, setAmount] = React.useState("100000");
  const [auto, setAuto] = React.useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="rounded-2xl">New Goal</Button>}
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Title</div>
            <Input className="rounded-2xl" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Target amount (₹)</div>
            <Input className="rounded-2xl" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-3">
            <div>
              <div className="text-sm font-medium">Auto-allocate unused budget</div>
              <div className="text-xs text-muted-foreground">Move leftover amounts to this goal.</div>
            </div>
            <Switch checked={auto} onCheckedChange={setAuto} />
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
