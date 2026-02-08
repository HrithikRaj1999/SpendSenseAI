import type { Txn } from "@/features/expenses/types";
import type { Budget } from "@/features/budgets/utils/types";

// -------------------- Persist Key --------------------
const DB_KEY = "mockdb:v1";

// -------------------- Initial Data --------------------
// We can re-use the generator logic from your old `dummy/db.ts` or keep it simple.
// For now, let's include a small set of initial data or fully generate it if empty.

function createInitialData() {
  const txns: Txn[] = []; // start empty or generate
  const budgets: Record<string, Budget> = {
    // default budget for current month + next month
    "2026-02": {
      id: "b1",
      month: "2026-02",
      totalLimit: 25000,
      mode: "STRICT",
      rolloverUnused: true,
      currency: "INR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "2026-03": {
      id: "b2",
      month: "2026-03",
      totalLimit: 30000,
      mode: "FLEXIBLE",
      rolloverUnused: false,
      currency: "INR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return { txns, budgets };
}

// -------------------- Types --------------------
export type MockDBState = {
  txns: Txn[];
  budgets: Record<string, Budget>;
};

// -------------------- Singleton --------------------
class MockDBImpl {
  private data: MockDBState;

  constructor() {
    this.data = this.load() || createInitialData();
    // Verify if we have transactions, if not, maybe generate some?
    // For now, we trust the `load()` or `createInitialData()`.
    // In a real app we might want to seed random data if empty.
    if (this.data.txns.length === 0) {
      this.seedRandomTxns();
    }
  }

  // --- Persistence ---
  private load(): MockDBState | null {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load MockDB", e);
      return null;
    }
  }

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private save() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
        console.log("[MockDB] Saved to localStorage");
      } catch (e) {
        console.error("Failed to save MockDB", e);
      }
    }, 500); // throttle 500ms
  }

  // --- Helpers ---
  // Always return clones to prevent RTK Query freezing issues

  get transactions(): Txn[] {
    return this.data.txns.map((t) => ({ ...t }));
  }

  get budgets(): Record<string, Budget> {
    // deep clone the registry
    return JSON.parse(JSON.stringify(this.data.budgets));
  }

  // --- Budget Ops ---
  getBudget(month: string): Budget | null {
    const b = this.data.budgets[month];
    return b ? { ...b } : null; // clone
  }

  listBudgetMonths(): string[] {
    // return sorted keys
    return Object.keys(this.data.budgets).sort().reverse();
  }

  setBudget(month: string, budget: Budget) {
    this.data.budgets[month] = { ...budget };
    this.save();
    return this.getBudget(month);
  }

  deleteBudget(month: string) {
    delete this.data.budgets[month];
    this.save();
  }

  // --- Expense Ops ---
  addTransaction(txn: Txn) {
    this.data.txns.unshift({ ...txn });
    this.save();
    return { ...txn };
  }

  updateTransaction(id: string, patch: Partial<Txn>) {
    const idx = this.data.txns.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    this.data.txns[idx] = { ...this.data.txns[idx], ...patch };
    this.save();
    return { ...this.data.txns[idx] };
  }

  getTransaction(id: string) {
    const t = this.data.txns.find((t) => t.id === id);
    return t ? { ...t } : null;
  }

  deleteTransactions(ids: string[]) {
    // Hard delete
    const set = new Set(ids);
    this.data.txns = this.data.txns.filter((t) => !set.has(t.id));
    this.save();
  }

  softDeleteTransactions(ids: string[]) {
    const set = new Set(ids);
    this.data.txns = this.data.txns.map((t) => {
      if (set.has(t.id)) {
        return { ...t, deletedAt: new Date().toISOString() };
      }
      return t;
    });
    this.save();
  }

  restoreTransactions(ids: string[]) {
    const set = new Set(ids);
    this.data.txns = this.data.txns.map((t) => {
      if (set.has(t.id)) {
        return { ...t, deletedAt: null };
      }
      return t;
    });
    this.save();
  }

  // --- Seed Data (Optional) ---
  private seedRandomTxns() {
    // Just some simple seed data so it's not empty
    this.data.txns = [
      {
        id: "t1",
        title: "Grocery Run",
        category: "Groceries",
        amount: 1200,
        date: "2026-02-05T10:00:00Z",
        paymentMethod: "UPI",
        deletedAt: null,
      },
      {
        id: "t2",
        title: "Netflix Subscription",
        category: "Entertainment",
        amount: 499,
        date: "2026-02-02T10:00:00Z",
        paymentMethod: "Card",
        deletedAt: null,
      },
      {
        id: "t3",
        title: "Uber Ride",
        category: "Transport",
        amount: 350,
        date: "2026-02-06T18:00:00Z",
        paymentMethod: "UPI",
        deletedAt: null,
      },
    ];
    this.save();
  }
}

// -------------------- Global Singleton --------------------
// Ensure we don't re-create DB on HMR
const globalKey = Symbol.for("MockDB");
const globalScope = globalThis as any;

if (!globalScope[globalKey]) {
  globalScope[globalKey] = new MockDBImpl();
}

export const MockDB = globalScope[globalKey] as MockDBImpl;
