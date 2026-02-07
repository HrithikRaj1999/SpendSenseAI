import type { BudgetMode, Severity } from "./types";

export const MODE_LABEL: Record<BudgetMode, string> = {
  STRICT: "Strict",
  FLEXIBLE: "Flexible",
  SAVINGS: "Savings",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  OK: "Safe",
  WARN: "Warning",
  DANGER: "Over",
};
