import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryBudget } from "../../utils/types";

export function EditCategoryBudgetModal({
  open,
  onOpenChange,
  item,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item?: CategoryBudget | null;
  onSave?: (limit: number) => void;
}) {
  const [limit, setLimit] = React.useState("");

  React.useEffect(() => {
    if (item) setLimit(String(item.limit));
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit category budget</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">{item?.category}</div>
          <Input className="rounded-2xl" value={limit} onChange={(e) => setLimit(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                const n = Number(limit);
                if (!Number.isFinite(n)) return;
                onSave?.(n);
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
