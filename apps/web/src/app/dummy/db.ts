// ---------- shared helpers ----------
import {
  GetTransactionsArgs,
  Timeframe,
  TransactionsDTO,
  Txn,
} from "@/features/expenses/types";
import { DashboardDTO } from "@/features/dashboard/utils/types";

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

const METHODS: Txn["paymentMethod"][] = ["UPI", "Card", "NetBanking", "Cash"];

// ---------- generate ONE master transactions list ----------
function makeDummyTxns(count = 220): Txn[] {
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

// ✅ SINGLE SOURCE OF TRUTH
export const DummyDB = {
  transactions: makeDummyTxns(240),
};

// ---------- dashboard DTO derived from master txns ----------
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
  // Simple daily aggregation (YYYY-MM-DD)
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.date.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + r.amount);
  }
  return [...map.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function currentMonthKey() {
  // for dummy, keep it fixed like your earlier example
  return "2026-02";
}

function pickMonth(rows: Txn[], monthKey: string) {
  return rows.filter((r) => r.date.startsWith(monthKey));
}

export function getDashboardDTO(): DashboardDTO {
  const monthKey = currentMonthKey();
  const monthRows = pickMonth(DummyDB.transactions, monthKey);

  const monthSpend = sumAmount(monthRows);
  const monthBudget = 35000;
  const savingsEstimate = Math.max(0, monthBudget - monthSpend);

  const categories = groupByCategory(monthRows);
  const biggestCategory = categories[0]?.name ?? "—";

  const trend = buildTrend(monthRows);

  // recent = top 5 of month
  const recent = monthRows.slice(0, 5);

  return {
    summary: {
      monthSpend,
      monthBudget,
      savingsEstimate,
      biggestCategory,
    },
    trend,
    categories: categories.slice(0, 8),
    recent,
  };
}

// ---------- transactions query (filter/paginate) ----------
function inRange(d: string, from?: string, to?: string) {
  const t = new Date(d).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime()) return false;
  return true;
}

function filterByTimeframe(rows: Txn[], args: GetTransactionsArgs) {
  const tf: Timeframe = args.timeframe;

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

  if (args.search?.trim()) {
    const s = args.search.toLowerCase();
    out = out.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s),
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

// used by transactionsApi queryFn
export async function queryTransactions(
  args: GetTransactionsArgs,
): Promise<TransactionsDTO> {
  await sleep(350);

  const filtered = applyFilters(DummyDB.transactions, args);

  const page = Math.max(1, args.page ?? 1);
  const limit = Math.min(100, Math.max(10, args.limit ?? 25));
  const start = (page - 1) * limit;

  return {
    rows: filtered.slice(start, start + limit),
    total: filtered.length,
  };
}
