import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

function monthOptions(count = 12) {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    out.push(`${d.getFullYear()}-${m}`);
  }
  return out;
}

export function BudgetMonthPicker() {
  const [params, setParams] = useSearchParams();
  const value = params.get("month") ?? monthOptions(1)[0];
  const opts = React.useMemo(() => monthOptions(12), []);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        params.set("month", v);
        setParams(params, { replace: true });
      }}
    >
      <SelectTrigger className="w-[140px] rounded-2xl">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        {opts.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
