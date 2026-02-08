import { MockDB } from "./mockDb";
import type { Budget } from "@/features/budgets/utils/types";
import { type Txn } from "@/features/expenses/types";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { normalizeMonth } from "@/utils/dateUtils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// -------------------- Request Type --------------------
type MockRequest = {
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  params?: Record<string, string>;
};

// -------------------- Helpers --------------------
function getQueryParams(url: string) {
  const idx = url.indexOf("?");
  if (idx === -1) return new URLSearchParams();
  return new URLSearchParams(url.substring(idx + 1));
}

function matchRoute(
  url: string,
  method: string,
  pattern: string,
  reqMethod: string,
) {
  if (method !== reqMethod) return null;
  const cleanUrl = url.split("?")[0];
  const urlParts = cleanUrl.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);

  if (urlParts.length !== patternParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const u = urlParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = u;
    } else if (p !== u) {
      return null;
    }
  }
  return params;
}

// -------------------- Filtering Logic --------------------
function filterTransactions(txns: Txn[], params: URLSearchParams | any) {
  let rows = [...txns]; // Clone
  const p =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : params;

  // 1. Search (Title, Category, PaymentMethod)
  if (p.search) {
    const s = p.search.toLowerCase();
    rows = rows.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        t.paymentMethod.toLowerCase().includes(s),
    );
  }

  // 2. Filters
  if (p.category && p.category !== "All") {
    rows = rows.filter((t) => t.category === p.category);
  }
  if (p.paymentMethod && p.paymentMethod !== "All") {
    rows = rows.filter((t) => t.paymentMethod === p.paymentMethod);
  }

  // 3. Timeframe
  const timeframe = p.timeframe || "month";

  if (timeframe === "month" && p.month) {
    rows = rows.filter((t) => t.date.startsWith(p.month));
  } else if (timeframe === "quarter" && p.quarter) {
    // YYYY-Q1
    const [year, q] = p.quarter.split("-Q");
    const quarterIndex = parseInt(q) - 1;
    const startDate = startOfQuarter(
      new Date(parseInt(year), quarterIndex * 3),
    );
    const endDate = endOfQuarter(startDate);
    rows = rows.filter((t) =>
      isWithinInterval(parseISO(t.date), { start: startDate, end: endDate }),
    );
  } else if (timeframe === "year" && p.year) {
    rows = rows.filter((t) => t.date.startsWith(p.year));
  } else if (timeframe === "custom" && p.from && p.to) {
    rows = rows.filter((t) =>
      isWithinInterval(parseISO(t.date), {
        start: parseISO(p.from),
        end: parseISO(p.to),
      }),
    );
  }

  return rows;
}

function sortTransactions(rows: Txn[], sort: string, order: "asc" | "desc") {
  return rows.sort((a, b) => {
    let valA: any = a[sort as keyof Txn];
    let valB: any = b[sort as keyof Txn];

    if (sort === "date") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (sort === "amount") {
      valA = Number(valA);
      valB = Number(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

function calculateBudgetDTO(budget: Budget, month: string) {
  const txns = MockDB.transactions.filter(
    (t) => !t.deletedAt && t.date.startsWith(month),
  );
  const totalSpent = txns.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget.totalLimit - totalSpent;
  const percentUsed = Math.min(
    100,
    Math.round((totalSpent / budget.totalLimit) * 100),
  );

  // Days remaining
  const now = new Date();
  const isCurrentMonth = now.toISOString().startsWith(month);
  const endOfMonthDate = endOfMonth(parseISO(`${month}-01`));
  const daysRemaining = isCurrentMonth
    ? Math.max(
        0,
        Math.ceil(
          (endOfMonthDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;
  const dailyAllowance =
    daysRemaining > 0 ? Math.max(0, remaining / daysRemaining) : 0;

  const summary = {
    month,
    totalLimit: budget.totalLimit,
    totalSpent,
    remaining,
    percentUsed,
    dailyAllowance,
    daysRemaining,
  };

  // Category Breakdown
  const catMap = new Map<string, number>();
  txns.forEach((t) => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });

  const categories = Array.from(catMap.entries()).map(([cat, spent], idx) => ({
    id: `cb-${idx}`, // Should be unique
    month,
    category: cat as any,
    limit: 0,
    spent,
    remaining: 0 - spent,
    percentUsed: 100,
    severity: "OK" as const,
  }));

  const health = {
    score: percentUsed > 100 ? 20 : percentUsed > 90 ? 50 : 95,
    label:
      percentUsed > 100 ? "Critical" : percentUsed > 90 ? "At Risk" : "Great",
    reasons: percentUsed > 90 ? ["Spending is high"] : ["Spending is on track"],
  } as const;

  const forecast = {
    projectedRunoutDate:
      percentUsed > 100 ? new Date().toISOString() : undefined,
    note: percentUsed > 100 ? "Budget exceeded" : "On track to save",
  };

  const suggestions = [
    {
      id: "s1",
      title: "Reduce Dining Out",
      detail: "You spent 15% more on dining this month.",
      impactINR: 1200,
      action: "TUNE_LIMITS" as const,
    },
  ];

  const usageSeries = txns
    .reduce((acc: any[], t) => {
      const date = t.date.split("T")[0];
      const existing = acc.find((x) => x.date === date);
      if (existing) {
        existing.spent += t.amount;
      } else {
        acc.push({ date, spent: t.amount, budgetLine: budget.totalLimit / 30 });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const heatmap = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 2000),
    severity: "OK" as const,
  }));

  return {
    budget,
    summary,
    health,
    forecast,
    suggestions,
    categories,
    alertRules: [],
    guardrails: [],
    goals: [],
    usageSeries,
    heatmap,
    history: [],
  };
}

// -------------------- Implementation --------------------

export async function mockFetch(req: MockRequest): Promise<any> {
  console.log(`[MockServer] ${req.method} ${req.url}`);
  await sleep(200 + Math.random() * 200);

  const { url, method, body } = req;
  const searchParams = getQueryParams(url);

  // ---------------- Budgets ----------------

  // GET /budgets/months
  if (url.startsWith("/budgets/months") && method === "GET") {
    const months = MockDB.listBudgetMonths();
    return { months }; // Already sorted desc in DB
  }

  // GET /budgets/:month
  const matchBudgetParams = matchRoute(url, method, "/budgets/:month", "GET");
  if (matchBudgetParams) {
    const { month } = matchBudgetParams;
    const normalized = normalizeMonth(month);
    if (!normalized) throw { status: 400, message: "Invalid month format" };

    let budget = MockDB.getBudget(normalized);

    if (!budget) {
      // Return null instead of 404 to indicate no budget set for this month
      return { budget: null } as any;
    }

    // Calculate Summary & Categories from real Txns
    const txns = MockDB.transactions.filter(
      (t) => !t.deletedAt && t.date.startsWith(month),
    );
    const totalSpent = txns.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.totalLimit - totalSpent;
    const percentUsed = Math.min(
      100,
      Math.round((totalSpent / budget.totalLimit) * 100),
    );

    // Days remaining
    const now = new Date();
    const isCurrentMonth = now.toISOString().startsWith(month);
    const endOfMonthDate = endOfMonth(parseISO(`${month}-01`));
    const daysRemaining = isCurrentMonth
      ? Math.max(
          0,
          Math.ceil(
            (endOfMonthDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;
    const dailyAllowance =
      daysRemaining > 0 ? Math.max(0, remaining / daysRemaining) : 0;

    const summary = {
      month,
      totalLimit: budget.totalLimit,
      totalSpent,
      remaining,
      percentUsed,
      dailyAllowance,
      daysRemaining,
    };

    // Category Breakdown
    const catMap = new Map<string, number>();
    txns.forEach((t) => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });

    // We need limits for categories. For now, assume no specific category limits (or mock them)
    // In a real app, Budget object would have categoryLimits or separate table.
    const categories = Array.from(catMap.entries()).map(
      ([cat, spent], idx) => ({
        id: `cb-${idx}`,
        month,
        category: cat as any,
        limit: 0, // No limit set in simple Budget model
        spent,
        remaining: 0 - spent,
        percentUsed: 100, // No limit
        severity: "OK" as const,
      }),
    );

    // Mock other fields for DTO
    const health = {
      score: percentUsed > 100 ? 20 : percentUsed > 90 ? 50 : 95,
      label:
        percentUsed > 100 ? "Critical" : percentUsed > 90 ? "At Risk" : "Great",
      reasons:
        percentUsed > 90 ? ["Spending is high"] : ["Spending is on track"],
    } as const;

    const forecast = {
      projectedRunoutDate:
        percentUsed > 100 ? new Date().toISOString() : undefined,
      note: percentUsed > 100 ? "Budget exceeded" : "On track to save",
    };

    const suggestions = [
      {
        id: "s1",
        title: "Reduce Dining Out",
        detail: "You spent 15% more on dining this month.",
        impactINR: 1200,
        action: "TUNE_LIMITS" as const,
      },
    ];

    const usageSeries = txns
      .reduce((acc: any[], t) => {
        const date = t.date.split("T")[0];
        const existing = acc.find((x) => x.date === date);
        if (existing) {
          existing.spent += t.amount;
        } else {
          acc.push({
            date,
            spent: t.amount,
            budgetLine: budget.totalLimit / 30,
          }); // crude line
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Fill gaps in usageSeries if needed, but for mock this is fine.

    // Heatmap (Generating dummy heatmap data)
    const heatmap = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      value: Math.floor(Math.random() * 2000),
      severity: "OK" as const,
    }));

    const response = {
      budget,
      summary,
      health,
      forecast,
      suggestions,
      categories,
      alertRules: [],
      guardrails: [],
      goals: [],
      usageSeries,
      heatmap,
      history: [],
    };

    return response;
  }

  // POST /budgets (Create)
  // Fix: strict check for path to avoid matching sub-paths
  const path = url.split("?")[0];
  if (path === "/budgets" && method === "POST") {
    const { month, totalLimit, mode, rolloverUnused } = body;
    const normalized = normalizeMonth(month);
    if (!normalized) throw { status: 400, message: "Invalid month format" };

    const newBudget: Budget = {
      id: Math.random().toString(36).substring(7),
      month: normalized,
      totalLimit,
      mode,
      rolloverUnused,
      currency: "INR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = MockDB.setBudget(normalized, newBudget);
    return calculateBudgetDTO(created!, normalized);
  }

  // PATCH /budgets/:month
  const matchPatchBudget = matchRoute(url, method, "/budgets/:month", "PATCH");
  if (matchPatchBudget) {
    const { month } = matchPatchBudget;
    const normalized = normalizeMonth(month);
    if (!normalized) throw { status: 400, message: "Invalid month format" };

    const current = MockDB.getBudget(normalized);
    if (!current) throw { status: 404, message: "Budget not found" };

    const updated = MockDB.setBudget(normalized, {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    });
    return calculateBudgetDTO(updated!, normalized);
  }

  // POST /budgets/:month/clone
  const matchClone = matchRoute(url, method, "/budgets/:month/clone", "POST");
  if (matchClone) {
    const { month } = matchClone;
    const normalized = normalizeMonth(month);
    if (!normalized)
      throw { status: 400, message: "Invalid source month format" };

    const { toMonth } = body;
    const normalizedTo = normalizeMonth(toMonth);
    if (!normalizedTo)
      throw { status: 400, message: "Invalid target month format" };

    const source = MockDB.getBudget(normalized);
    if (!source) throw { status: 404, message: "Source budget not found" };

    const newBudget: Budget = {
      ...source,
      id: Math.random().toString(36).substring(7),
      month: normalizedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = MockDB.setBudget(normalizedTo, newBudget);
    return calculateBudgetDTO(created!, normalizedTo);
  }

  // POST /budgets/:month/reset
  const matchReset = matchRoute(url, method, "/budgets/:month/reset", "POST");
  if (matchReset) {
    const { month } = matchReset;
    const normalized = normalizeMonth(month);
    if (!normalized) throw { status: 400, message: "Invalid month format" };

    const current = MockDB.getBudget(normalized);

    const defaults: Budget = {
      id: current?.id || Math.random().toString(36).substring(7),
      month: normalized,
      totalLimit: 25000,
      mode: "STRICT",
      rolloverUnused: true,
      currency: "INR",
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const reset = MockDB.setBudget(normalized, defaults);
    return calculateBudgetDTO(reset!, normalized);
  }

  // ---------------- Expenses ----------------

  // GET /expenses
  if (
    url.startsWith("/expenses") &&
    method === "GET" &&
    !url.includes("/trash") &&
    !url.includes("/recurring") &&
    !url.includes("/duplicates") &&
    !url.includes("/insights") &&
    !url.includes("/ask-ai")
  ) {
    let rows = MockDB.transactions.filter((t) => !t.deletedAt);
    rows = filterTransactions(rows, searchParams);

    // Sorting
    const sort = searchParams.get("sort") || "date";
    const order = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    rows = sortTransactions(rows, sort, order);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const total = rows.length;
    const start = (page - 1) * limit;
    const paginated = rows.slice(start, start + limit);

    return { rows: paginated, total };
  }

  // GET /expenses/trash
  if (url.startsWith("/expenses/trash") && method === "GET") {
    let rows = MockDB.transactions.filter((t) => t.deletedAt);

    // Sort by deletedAt desc usually
    rows.sort(
      (a, b) =>
        new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime(),
    );

    return { rows, total: rows.length };
  }

  // POST /expenses (Create)
  // Fix: strict check for path to avoid matching sub-paths
  const expensePath = url.split("?")[0];
  if (expensePath === "/expenses" && method === "POST") {
    const txn = MockDB.addTransaction({
      id: Math.random().toString(36).substring(7),
      ...body,
      deletedAt: null,
    });
    return txn;
  }

  // PATCH /expenses/:id
  const matchPatchExpense = matchRoute(url, method, "/expenses/:id", "PATCH");
  if (matchPatchExpense) {
    const { id } = matchPatchExpense;
    const updated = MockDB.updateTransaction(id, body);
    if (!updated) throw { status: 404, message: "Transaction not found" };
    return updated;
  }

  // POST /expenses/bulk-update
  if (url === "/expenses/bulk-update" && method === "POST") {
    const { ids, patch } = body;
    if (!Array.isArray(ids))
      throw { status: 400, message: "ids must be array" };
    let count = 0;
    ids.forEach((id: string) => {
      if (MockDB.updateTransaction(id, patch)) count++;
    });
    return { ok: true, updated: count };
  }

  // POST /expenses/soft-delete
  if (url === "/expenses/soft-delete" && method === "POST") {
    const { ids } = body;
    MockDB.softDeleteTransactions(ids);
    return { ok: true, deleted: ids.length };
  }

  // POST /expenses/soft-delete/filter
  if (url === "/expenses/soft-delete/filter" && method === "POST") {
    const { args, excludeIds = [] } = body;
    let rows = MockDB.transactions.filter((t) => !t.deletedAt);

    // Re-use filter logic, need to parse args similar to URLSearchParams
    const params = new URLSearchParams(args);
    rows = filterTransactions(rows, params);

    const idsToDelete = rows
      .map((r) => r.id)
      .filter((id) => !excludeIds.includes(id));

    MockDB.softDeleteTransactions(idsToDelete);
    return { ok: true, deleted: idsToDelete.length };
  }

  // POST /expenses/bulk-update/filter
  if (url === "/expenses/bulk-update/filter" && method === "POST") {
    const { args, patch, excludeIds = [] } = body;
    let rows = MockDB.transactions.filter((t) => !t.deletedAt);

    const params = new URLSearchParams(args);
    rows = filterTransactions(rows, params);

    const idsToUpdate = rows
      .map((r) => r.id)
      .filter((id) => !excludeIds.includes(id));

    let count = 0;
    idsToUpdate.forEach((id) => {
      if (MockDB.updateTransaction(id, patch)) count++;
    });
    return { ok: true, updated: count };
  }

  // POST /expenses/restore
  if (url === "/expenses/restore" && method === "POST") {
    const { ids } = body;
    MockDB.restoreTransactions(ids);
    return { ok: true, restored: ids.length };
  }

  // POST /expenses/hard-delete
  if (url === "/expenses/hard-delete" && method === "POST") {
    const { ids } = body;
    MockDB.deleteTransactions(ids);
    return { ok: true, removed: ids.length };
  }

  // ---------------- Dashboard ----------------

  if (url.startsWith("/dashboard") && method === "GET") {
    const rawMonth = searchParams.get("month");
    if (!rawMonth) throw { status: 400, message: "Month is required" };

    const month = normalizeMonth(rawMonth);
    if (!month) throw { status: 400, message: "Invalid month format" };

    const txns = MockDB.transactions.filter(
      (t) => !t.deletedAt && t.date.startsWith(month),
    );
    // ... rest of dashboard logic
    const monthSpend = txns.reduce((sum, t) => sum + t.amount, 0);

    const budget = MockDB.getBudget(month);
    const monthBudget = budget ? budget.totalLimit : 0;
    const savingsEstimate = Math.max(0, monthBudget - monthSpend);

    // Categories
    const categoryMap = new Map<string, number>();
    txns.forEach((t) => {
      categoryMap.set(
        t.category,
        (categoryMap.get(t.category) || 0) + t.amount,
      );
    });
    const categories = Array.from(categoryMap.entries())
      .map(([name, amount], index) => ({ id: `c-${index}`, name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const biggestCategory = categories[0]?.name || "—";

    // Trend (Daily)
    const trendMap = new Map<string, number>();
    txns.forEach((t) => {
      const d = t.date.split("T")[0];
      trendMap.set(d, (trendMap.get(d) || 0) + t.amount);
    });
    const trend = Array.from(trendMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Recent
    const recent = txns
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      summary: {
        monthSpend,
        monthBudget,
        savingsEstimate,
        biggestCategory,
      },
      trend,
      categories,
      recent,
    };
  }

  // ---------------- Recurring / Insights / Ask AI ----------------
  // (Keeping existing logic for these if not specified to change, just ensure they are reachable)

  if (url.startsWith("/expenses/recurring") && method === "GET") {
    const txns = MockDB.transactions.filter((t) => !t.deletedAt);
    const counts = new Map<string, Txn[]>();
    txns.forEach((t) => {
      const key = t.title + "|" + t.paymentMethod;
      const list = counts.get(key) || [];
      list.push(t);
      counts.set(key, list);
    });

    const recurring: any[] = [];
    counts.forEach((list) => {
      if (list.length >= 2) {
        const t = list[0];
        const avgAmount = list.reduce((s, x) => s + x.amount, 0) / list.length;
        recurring.push({
          id: "rec_" + t.id,
          title: t.title,
          category: t.category,
          avgAmount: Math.round(avgAmount),
          cadence: "Monthly",
          nextDue: new Date(Date.now() + 7 * 86400000).toISOString(),
          lastSeen: list[0].date,
          paymentMethod: t.paymentMethod,
        });
      }
    });
    return recurring.slice(0, 5);
  }

  if (url.startsWith("/expenses/insights") && method === "GET") {
    const month =
      searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const txns = MockDB.transactions.filter(
      (t) => !t.deletedAt && t.date.startsWith(month),
    );
    const spend = txns.reduce((s, t) => s + t.amount, 0);

    const catMap = new Map<string, number>();
    txns.forEach((t) =>
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount),
    );
    const byCategory = Array.from(catMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const methodMap = new Map<string, number>();
    txns.forEach((t) =>
      methodMap.set(
        t.paymentMethod,
        (methodMap.get(t.paymentMethod) || 0) + t.amount,
      ),
    );
    const byMethod = Array.from(methodMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Top Merchants logic
    const merchMap = new Map<string, { amount: number; count: number }>();
    txns.forEach((t) => {
      const m = merchMap.get(t.title) || { amount: 0, count: 0 };
      m.amount += t.amount;
      m.count++;
      merchMap.set(t.title, m);
    });
    const topMerchants = Array.from(merchMap.entries())
      .map(([title, v]) => ({ title, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totals: { month, spend, txns: txns.length },
      byCategory,
      byMethod,
      topMerchants,
      unusual: [],
    };
  }

  if (url.startsWith("/expenses/ask-ai") && method === "POST") {
    return {
      question: body.question,
      answer: "AI analysis is simulated.",
      bullets: ["Insight 1", "Insight 2"],
    };
  }

  console.warn(`[MockServer] Unhandled request: ${method} ${url}`);
  throw { status: 404, message: "Not Found" };
}
