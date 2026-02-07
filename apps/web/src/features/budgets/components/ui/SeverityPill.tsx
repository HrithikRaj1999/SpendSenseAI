import { cn } from "@/lib/utils";
import type { Severity } from "../../utils/types";
import { SEVERITY_LABEL } from "../../utils/labels";

export function SeverityPill({ severity }: { severity: Severity }) {
  const cls =
    severity === "DANGER"
      ? "bg-destructive/15 text-destructive"
      : severity === "WARN"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
