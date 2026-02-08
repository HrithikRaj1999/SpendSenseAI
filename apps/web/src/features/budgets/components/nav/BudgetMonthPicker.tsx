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
    if (value) set.add(value); // Only add if value exists
    return Array.from(set).sort().reverse(); // Show newest first
  }, [options, value]);

  // URL → state on mount or URL change
  // If URL has month, sync to internal value (handled by parent passing 'value')
  // But if URL doesn't have month, parent might want to set default.
  // Actually parent manages state.

  // When value changes from Parent (e.g. initial load or reset), update URL
  React.useEffect(() => {
    const urlMonth = params.get("month");
    if (value && urlMonth !== value) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("month", value);
          return next;
        },
        { replace: true },
      );
    }
  }, [value, params, setParams]);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v);
        setParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("month", v);
            return next;
          },
          { replace: true },
        );
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
