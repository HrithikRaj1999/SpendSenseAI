import type { Money, Severity } from "./types";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function pct(used: number, total: number) {
  if (!total) return 0;
  return clamp(Math.round((used / total) * 100), 0, 100);
}

export function severityFromPct(p: number): Severity {
  if (p >= 100) return "DANGER";
  if (p >= 75) return "WARN";
  return "OK";
}

export function toINR(n: Money) {
  // avoid Intl edge issues in some minimal test envs
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n)}`;
  }
}
