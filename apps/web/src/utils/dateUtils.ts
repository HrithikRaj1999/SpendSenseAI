

/**
 * Normalizes a month string to YYYY-MM format.
 * Handles formats like:
 * - "2026-3" -> "2026-03"
 * - "2026-03" -> "2026-03"
 * - "2026/3" -> "2026-03"
 * Returns null if invalid.
 */
export function normalizeMonth(input: string): string | null {
  if (!input) return null;

  // Try ISO format (YYYY-MM)
  // Simple regex check for YYYY-M or YYYY-MM
  // Also handle / separator
  const clean = input.replace("/", "-");

  // validation regex: ^\d{4}-\d{1,2}$
  if (!/^\d{4}-\d{1,2}$/.test(clean)) {
    return null;
  }

  const parts = clean.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return null;
  }

  return `${year}-${month.toString().padStart(2, "0")}`;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
