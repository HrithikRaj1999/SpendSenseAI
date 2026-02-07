import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (month: string) => void;
  options: string[]; // ✅ dynamic months from DB
  disabled?: boolean;
};

export function BudgetMonthPicker({
  value,
  onChange,
  options,
  disabled,
}: Props) {
  const [params, setParams] = useSearchParams();

  // Ensure selected month is always visible in dropdown
  const opts = React.useMemo(() => {
    const set = new Set(options);
    set.add(value);
    return Array.from(set).sort();
  }, [options, value]);

  // URL → state on mount
  React.useEffect(() => {
    const urlMonth = params.get("month");
    if (urlMonth && urlMonth !== value) onChange(urlMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // state → URL
  React.useEffect(() => {
    const urlMonth = params.get("month");
    if (value && urlMonth !== value) {
      const next = new URLSearchParams(params);
      next.set("month", value);
      setParams(next, { replace: true });
    }
  }, [value, params, setParams]);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v);
        const next = new URLSearchParams(params);
        next.set("month", v);
        setParams(next, { replace: true });
      }}
      disabled={disabled}
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
