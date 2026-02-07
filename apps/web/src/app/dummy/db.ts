import type { DashboardDTO } from "@/features/dashboard/utils/types";
import type {
  CreateExpenseInput,
  PaymentMethod,
  Txn,
} from "@/features/expenses/types";

// -------------------- shared utils --------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad2 = (n: number) => String(n).padStart(2, "0");
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Rent",
  "Groceries",
];
const METHODS: PaymentMethod[] = ["UPI", "Card", "NetBanking", "Cash"];
// -------------------- expanded dummy DB (1000+ entries) --------------------

/**
 * Generates a larger dataset of transactions bounded by the Txn type.
 * Defaulting to 1200 to ensure a robust "1000+" requirement.
 */
function makeLargeDummyTxns(count = 1200): Txn[] {
  const out: Txn[] = [];

  // Refined title pools for more realistic 1000+ entry variety
  const VENDORS: Record<string, string[]> = {
    "Food & Dining": [
      "Swiggy",
      "Zomato",
      "Starbucks",
      "Pizza Hut",
      "Taco Bell",
      "Local Cafe",
      "Fine Dine",
      "Burger King",
    ],
    Transport: [
      "Uber",
      "Ola",
      "Metro Recharge",
      "Shell Fuel Station",
      "Auto Rickshaw",
      "Parking Fee",
      "Train Ticket",
      "Airlines",
    ],
    Shopping: [
      "Amazon",
      "Myntra",
      "Flipkart",
      "Zara",
      "H&M",
      "Nike Store",
      "Apple Store",
      "Local Boutique",
    ],
    Bills: [
      "Electricity Board",
      "Airtel Wifi",
      "Jio Mobile",
      "Gas Pipeline",
      "Water Bill",
      "Insurance Premium",
    ],
    Health: [
      "Apollo Pharmacy",
      "City Hospital",
      "General Physician",
      "MuscleBlaze",
      "Diagnostic Lab",
      "Gym Membership",
    ],
    Entertainment: [
      "PVR Cinemas",
      "Netflix",
      "Spotify",
      "Steam Games",
      "BookMyShow",
      "Bowling Alley",
      "Art Workshop",
    ],
    Groceries: [
      "BigBasket",
      "DMart",
      "Reliance Fresh",
      "Instamart",
      "Milk Basket",
      "Organic Store",
      "Local Mandi",
    ],
    Rent: ["House Rent", "Society Maintenance"],
  };

  for (let i = 0; i < count; i++) {
    const year = 2025 + Math.floor(i / 500); // Spans across 2025 and 2026
    const month = randInt(1, 12);
    const day = randInt(1, 28);
    const hour = randInt(0, 23);
    const min = randInt(0, 59);

    const category = CATEGORIES[randInt(0, CATEGORIES.length - 1)];
    const paymentMethod = METHODS[randInt(0, METHODS.length - 1)];

    // Pricing Logic
    let amount = randInt(100, 2500);
    if (category === "Rent") amount = randInt(15000, 35000);
    if (category === "Bills") amount = randInt(400, 6000);
    if (category === "Shopping") amount = randInt(500, 15000);
    if (category === "Transport") amount = randInt(50, 1200);

    const vendorPool = VENDORS[category] || ["Misc Expense"];
    const title = vendorPool[randInt(0, vendorPool.length - 1)];
    const maybeReceipt =
      Math.random() < 0.12
        ? "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=60"
        : null;
    out.push({
      id: `txn_vol_${i + 1}`, // Unique ID for large set
      title,
      category,
      amount,
      date: `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(min)}:00.000Z`,
      paymentMethod,
      receiptUrl: maybeReceipt,
      deletedAt: null,
    });
  }

  // Sort by date descending
  return out.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// -------------------- master dummy DB --------------------
function makeDummyTxns(count = 240): Txn[] {
  const out: Txn[] = [];
  for (let i = 0; i < count; i++) {
    const year = 2026;
    const month = randInt(1, 12);
    const day = randInt(1, 28);
    const hour = randInt(0, 23);
    const min = randInt(0, 59);

    const category = CATEGORIES[randInt(0, CATEGORIES.length - 1)];
    const paymentMethod = METHODS[randInt(0, METHODS.length - 1)];

    const amount =
      category === "Rent"
        ? randInt(8000, 22000)
        : category === "Bills"
          ? randInt(500, 3500)
          : randInt(80, 3500);

    const title =
      category === "Food & Dining"
        ? ["Swiggy", "Zomato", "Cafe", "Restaurant"][randInt(0, 3)]
        : category === "Transport"
          ? ["Metro", "Fuel", "Uber", "Auto"][randInt(0, 3)]
          : category === "Shopping"
            ? ["Amazon", "Myntra", "Flipkart", "Store"][randInt(0, 3)]
            : category === "Bills"
              ? ["Electricity", "Wifi", "Mobile Recharge", "Gas"][randInt(0, 3)]
              : category === "Health"
                ? ["Pharmacy", "Doctor", "Protein", "Lab Test"][randInt(0, 3)]
                : category === "Entertainment"
                  ? ["Movie", "OTT", "Games", "Event"][randInt(0, 3)]
                  : category === "Groceries"
                    ? ["BigBasket", "DMart", "Local Store"][randInt(0, 2)]
                    : category === "Rent"
                      ? "House Rent"
                      : "Expense";

    out.push({
      id: `t${i + 1}`,
      title,
      category,
      amount,
      date: `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(min)}:00.000Z`,
      paymentMethod,
    });
  }

  // newest first
  out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return out;
}

export const DummyDB = {
  transactions: makeLargeDummyTxns(2000),
};

// -------------------- Dashboard derived from DB --------------------
function sumAmount(rows: Txn[]) {
  return rows.reduce((acc, r) => acc + r.amount, 0);
}
function groupByCategory(rows: Txn[]) {
  const map = new Map<string, number>();
  for (const r of rows)
    map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
  return [...map.entries()]
    .map(([name, amount], idx) => ({ id: `c${idx + 1}`, name, amount }))
    .sort((a, b) => b.amount - a.amount);
}
function buildTrend(rows: Txn[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.date.slice(0, 10); // YYYY-MM-DD
    map.set(d, (map.get(d) ?? 0) + r.amount);
  }
  return [...map.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
function pickMonth(rows: Txn[], monthKey: string) {
  return rows.filter((r) => r.date.startsWith(monthKey));
}

export function getDashboardDTO(): DashboardDTO {
  const monthKey = "2026-02"; // keep stable for demo
  const monthRows = pickMonth(DummyDB.transactions, monthKey);

  const monthSpend = sumAmount(monthRows);
  const monthBudget = 2500000;
  const savingsEstimate = Math.max(0, monthBudget - monthSpend);

  const categories = groupByCategory(monthRows);
  const biggestCategory = categories[0]?.name ?? "—";

  const trend = buildTrend(monthRows);
  const recent = monthRows.slice(0, 5);

  return {
    summary: { monthSpend, monthBudget, savingsEstimate, biggestCategory },
    trend,
    categories: categories.slice(0, 8),
    recent,
  };
}

// -------------------- Transactions “backend query” --------------------
export type Timeframe = "month" | "quarter" | "year" | "custom";
export type SortField =
  | "date"
  | "amount"
  | "title"
  | "category"
  | "paymentMethod";
export type SortOrder = "asc" | "desc";

export type GetTransactionsArgs = {
  timeframe: Timeframe;
  month?: string; // "YYYY-MM"
  quarter?: string; // "YYYY-Q1"
  year?: number;
  from?: string; // ISO
  to?: string; // ISO

  search?: string; // server side
  category?: string;
  paymentMethod?: string;

  sortField?: SortField;
  sortOrder?: SortOrder;

  page?: number;
  limit?: number;
};

export type TransactionsDTO = { rows: Txn[]; total: number };

// timeframe filtering (server)
function inRange(d: string, from?: string, to?: string) {
  const t = new Date(d).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime()) return false;
  return true;
}

function filterByTimeframe(rows: Txn[], args: GetTransactionsArgs) {
  const tf = args.timeframe;

  if (tf === "custom") {
    return rows.filter((r) => inRange(r.date, args.from, args.to));
  }
  if (tf === "month" && args.month) {
    return rows.filter((r) => r.date.startsWith(args.month!));
  }
  if (tf === "year" && args.year) {
    return rows.filter((r) => r.date.startsWith(String(args.year)));
  }
  if (tf === "quarter" && args.quarter) {
    const [y, q] = args.quarter.split("-");
    const quarter = q?.toUpperCase();
    const months =
      quarter === "Q1"
        ? ["01", "02", "03"]
        : quarter === "Q2"
          ? ["04", "05", "06"]
          : quarter === "Q3"
            ? ["07", "08", "09"]
            : ["10", "11", "12"];

    return rows.filter(
      (r) =>
        r.date.startsWith(`${y}-`) &&
        months.some((m) => r.date.startsWith(`${y}-${m}`)),
    );
  }

  return rows;
}

function applyFilters(rows: Txn[], args: GetTransactionsArgs) {
  let out = filterByTimeframe(rows, args);

  // ✅ exclude trash by default
  out = out.filter((r) => !r.deletedAt);

  if (args.search?.trim()) {
    const s = args.search.toLowerCase();
    out = out.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        r.paymentMethod.toLowerCase().includes(s),
    );
  }

  if (args.category && args.category !== "All") {
    out = out.filter((r) => r.category === args.category);
  }

  if (args.paymentMethod && args.paymentMethod !== "All") {
    out = out.filter((r) => r.paymentMethod === args.paymentMethod);
  }

  return out;
}

// sorting (server)
function sortRows(
  rows: Txn[],
  sortField?: SortField,
  sortOrder: SortOrder = "desc",
) {
  const dir = sortOrder === "asc" ? 1 : -1;

  const cmpStr = (a: string, b: string) => a.localeCompare(b) * dir;
  const cmpNum = (a: number, b: number) => (a - b) * dir;

  return [...rows].sort((a, b) => {
    const f = sortField ?? "date";

    if (f === "date")
      return cmpNum(new Date(a.date).getTime(), new Date(b.date).getTime());
    if (f === "amount") return cmpNum(a.amount, b.amount);
    if (f === "title") return cmpStr(a.title, b.title);
    if (f === "category") return cmpStr(a.category, b.category);
    return cmpStr(a.paymentMethod, b.paymentMethod);
  });
}

// pagination (server)
function paginate(rows: Txn[], page = 1, limit = 25) {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(10, limit));
  const start = (p - 1) * l;
  return rows.slice(start, start + l);
}

export async function queryTransactions(
  args: GetTransactionsArgs,
): Promise<TransactionsDTO> {
  await sleep(250);
  const filtered = applyFilters(DummyDB.transactions, args);
  const sorted = sortRows(filtered, args.sortField, args.sortOrder ?? "desc");
  const pageRows = paginate(sorted, args.page ?? 1, args.limit ?? 25);
  return { rows: pageRows, total: filtered.length };
}

const uid = () => `t${Math.random().toString(16).slice(2)}_${Date.now()}`;
/**
 * IMPORTANT:
 * RTK Query may freeze cached objects in dev (non-extensible),
 * so we must NEVER mutate Txn objects in-place.
 * Always replace the object in DummyDB.transactions.
 */
function replaceTxn(id: string, updater: (cur: Txn) => Txn) {
  const idx = DummyDB.transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  const cur = DummyDB.transactions[idx];
  DummyDB.transactions[idx] = updater(cur);
  return true;
}
function cloneTxn(t: Txn): Txn {
  // optional safety clone if you ever want to return fresh objects
  return { ...t };
}
function nowIso() {
  return new Date().toISOString();
}
// ---------------- CRUD (dummy “backend”) ----------------
export async function createExpense(input: CreateExpenseInput) {
  await sleep(200);

  const txn: Txn = {
    id: uid(),
    ...input,
    receiptUrl: (input as any).receiptUrl ?? null,
    deletedAt: null,
  };

  // newest first
  DummyDB.transactions = [txn, ...DummyDB.transactions];
  return cloneTxn(txn);
}

// ✅ update single expense (inline edits + edit dialog)
export async function updateExpense(id: string, patch: Partial<Txn>) {
  await sleep(200);

  const ok = replaceTxn(id, (cur) => ({
    ...cur,
    ...patch,
  }));

  if (!ok) throw new Error("Not found");
  const updated = DummyDB.transactions.find((t) => t.id === id)!;
  return cloneTxn(updated);
}

export async function softDeleteExpenses(ids: string[]) {
  await sleep(200);

  const at = nowIso();
  const idSet = new Set(ids);

  let deleted = 0;
  DummyDB.transactions = DummyDB.transactions.map((t) => {
    if (idSet.has(t.id) && !t.deletedAt) {
      deleted++;
      return { ...t, deletedAt: at };
    }
    return t;
  });

  return { ok: true, deleted };
}

export async function restoreExpenses(ids: string[]) {
  await sleep(200);

  const idSet = new Set(ids);

  let restored = 0;
  DummyDB.transactions = DummyDB.transactions.map((t) => {
    if (idSet.has(t.id) && t.deletedAt) {
      restored++;
      return { ...t, deletedAt: null };
    }
    return t;
  });

  return { ok: true, restored };
}

export async function hardDeleteExpenses(ids: string[]) {
  await sleep(200);

  const idSet = new Set(ids);
  const before = DummyDB.transactions.length;
  DummyDB.transactions = DummyDB.transactions.filter((t) => !idSet.has(t.id));
  const removed = before - DummyDB.transactions.length;

  return { ok: true, removed };
}

export async function listTrash() {
  await sleep(200);

  const rows = DummyDB.transactions
    .filter((t) => !!t.deletedAt)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime(),
    )
    .map(cloneTxn);

  return { rows, total: rows.length };
}

// ---------------- Duplicates (dummy) ----------------
export type DuplicatePair = {
  a: Txn;
  b: Txn;
  confidence: number; // 0..1
  reason: string;
};

export async function getDuplicateSuggestions(): Promise<DuplicatePair[]> {
  await sleep(250);

  const live = DummyDB.transactions.filter((t) => !t.deletedAt);
  const pairs: DuplicatePair[] = [];

  // simple: same amount + same day + similar title
  for (let i = 0; i < Math.min(live.length, 120); i++) {
    for (let j = i + 1; j < Math.min(live.length, 120); j++) {
      const a = live[i],
        b = live[j];
      const sameDay = a.date.slice(0, 10) === b.date.slice(0, 10);
      const sameAmount = a.amount === b.amount;
      const titleClose =
        a.title.toLowerCase() === b.title.toLowerCase() ||
        a.title.toLowerCase().includes(b.title.toLowerCase()) ||
        b.title.toLowerCase().includes(a.title.toLowerCase());

      if (sameDay && sameAmount && titleClose) {
        pairs.push({
          a,
          b,
          confidence: 0.86,
          reason: "Same date + same amount + similar title",
        });
        if (pairs.length >= 12) return pairs;
      }
    }
  }

  // fallback: return empty
  return pairs;
}

// ---------------- Recurring (dummy detection) ----------------
export type RecurringItem = {
  id: string;
  title: string;
  category: string;
  avgAmount: number;
  cadence: "Monthly" | "Weekly";
  nextDue: string; // ISO date
  lastSeen: string; // ISO date
  paymentMethod: PaymentMethod;
};

export async function getRecurring(): Promise<RecurringItem[]> {
  await sleep(250);

  // super simple heuristic: titles that appear >= 3 times
  const live = DummyDB.transactions.filter((t) => !t.deletedAt);
  const map = new Map<string, Txn[]>();
  for (const t of live) {
    const key = `${t.title.toLowerCase()}|${t.paymentMethod}`;
    map.set(key, [...(map.get(key) ?? []), t]);
  }

  const out: RecurringItem[] = [];
  for (const [key, rows] of map.entries()) {
    if (rows.length < 3) continue;

    const sorted = [...rows].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const title = sorted[0].title;
    const category = sorted[0].category;
    const paymentMethod = sorted[0].paymentMethod;
    const avgAmount = Math.round(
      sorted.reduce((s, r) => s + r.amount, 0) / sorted.length,
    );

    const lastSeen = sorted[sorted.length - 1].date;
    const nextDue = new Date(
      new Date(lastSeen).getTime() + 30 * 24 * 3600 * 1000,
    ).toISOString();

    out.push({
      id: `rec_${key}`,
      title,
      category,
      avgAmount,
      cadence: "Monthly",
      nextDue,
      lastSeen,
      paymentMethod,
    });

    if (out.length >= 8) break;
  }

  return out;
}

// ---------------- Insights (dummy) ----------------
export type ExpenseInsightsDTO = {
  totals: { month: string; spend: number; txns: number };
  byCategory: { name: string; amount: number }[];
  byMethod: { name: string; amount: number }[];
  topMerchants: { title: string; amount: number; count: number }[];
  unusual: Txn[]; // large txns
};
export async function bulkUpdateExpenses(ids: string[], patch: Partial<Txn>) {
  await sleep(200);

  const idSet = new Set(ids);
  let updated = 0;

  DummyDB.transactions = DummyDB.transactions.map((t) => {
    if (!t.deletedAt && idSet.has(t.id)) {
      updated++;
      return { ...t, ...patch };
    }
    return t;
  });

  return { ok: true, updated };
}

export async function softDeleteByFilter(
  args: GetTransactionsArgs,
  excludeIds: string[] = [],
) {
  await sleep(250);

  const ex = new Set(excludeIds);
  const filtered = applyFilters(DummyDB.transactions, args);

  const ids = filtered.map((t) => t.id).filter((id) => !ex.has(id));
  return softDeleteExpenses(ids);
}

export async function bulkUpdateByFilter(
  args: GetTransactionsArgs,
  patch: Partial<Txn>,
  excludeIds: string[] = [],
) {
  await sleep(250);

  const ex = new Set(excludeIds);
  const filtered = applyFilters(DummyDB.transactions, args);

  const ids = filtered.map((t) => t.id).filter((id) => !ex.has(id));
  return bulkUpdateExpenses(ids, patch);
}

export async function getExpenseInsights(
  monthKey = "2026-02",
): Promise<ExpenseInsightsDTO> {
  await sleep(250);

  const rows = DummyDB.transactions.filter(
    (t) => !t.deletedAt && t.date.startsWith(monthKey),
  );
  const spend = rows.reduce((s, r) => s + r.amount, 0);

  const cat = new Map<string, number>();
  const method = new Map<string, number>();
  const merch = new Map<string, { amount: number; count: number }>();

  for (const r of rows) {
    cat.set(r.category, (cat.get(r.category) ?? 0) + r.amount);
    method.set(r.paymentMethod, (method.get(r.paymentMethod) ?? 0) + r.amount);

    const m = merch.get(r.title) ?? { amount: 0, count: 0 };
    m.amount += r.amount;
    m.count += 1;
    merch.set(r.title, m);
  }

  const byCategory = [...cat.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  const byMethod = [...method.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  const topMerchants = [...merch.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  // unusual: top 5 highest
  const unusual = [...rows].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return {
    totals: { month: monthKey, spend, txns: rows.length },
    byCategory,
    byMethod,
    topMerchants,
    unusual,
  };
}

// ---------------- Ask AI (dummy) ----------------
export type AskAiDTO = {
  question: string;
  answer: string;
  bullets: string[];
};

export async function askAi(question: string): Promise<AskAiDTO> {
  await sleep(350);

  const q = question.toLowerCase();

  if (q.includes("food") || q.includes("dining")) {
    return {
      question,
      answer:
        "Your Food & Dining spend is trending higher than usual this month. Most of it is driven by frequent small orders.",
      bullets: [
        "Try a weekly cap for Food (e.g., ₹1,500/week) and track it.",
        "Batch orders: fewer deliveries reduces platform fees.",
        "Watch for peak-time ordering (Fri/Sat nights) — that’s where spend spikes.",
      ],
    };
  }

  return {
    question,
    answer:
      "Based on your recent transactions, the fastest savings usually comes from trimming high-frequency categories and reviewing large one-off spends.",
    bullets: [
      "Check your top 3 categories and set a soft limit for each.",
      "Review the biggest 5 transactions and mark any avoidable spend.",
      "Enable recurring detection to manage subscriptions proactively.",
    ],
  };
}
