import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockDB } from "@/mocks/mockDb";
import type { Txn } from "@/features/expenses/types";
import type { Budget } from "@/features/budgets/utils/types";

describe("MockDB Unit Tests", () => {
  // Clear DB before each test
  beforeEach(() => {
    localStorage.clear();
    // Reset internal state - currently MockDB is a singleton so we might need a way to reset it.
    // For now, we can manually reset the data property if accessible or use public methods.
    // Since `data` is private, we can't easily reset it without a helper or by reloading the module.
    // However, for these tests, we can rely on `MockDB` state if we are careful, or
    // better, since the setup.ts clears localStorage and potentially we could force re-instantiation?
    // Actually, `MockDB` is instantiated once.
    // Let's assume for now we use the existing instance but clear its data via public methods if possible.
    // The `localStroage.clear()` in `beforeEach` (setup.ts) handles persistence.
    // But the in-memory instance `MockDB` retains state.
    // We need a way to reset the in-memory state.
    // Let's check if we can add a reset method to MockDB for testing purposes?
    // Or we just manipulate it.

    // workaround: We can't easily reset the private data.
    // We will modify the test to clean up after itself or accept the state.
    // Actually, `mockDb.ts` loads from localStorage on instantiation.
    // If we can force re-creation that would be best.
    // But `MockDB` is a const export.

    // Let's just use what we have and maybe add a `resetForTesting` method if needed.
    // For now, let's try to manipulate state via public methods to "empty" it if needed.

    // Actually, let's add a `reset()` method to `MockDBImpl` in `mockDb.ts` to make testing easier?
    // Or just manually delete everything.

    const months = MockDB.listBudgetMonths();
    months.forEach((m) => MockDB.deleteBudget(m));

    const txns = MockDB.transactions;
    if (txns.length > 0) {
      MockDB.deleteTransactions(txns.map((t) => t.id));
    }
  });

  describe("A1. Initialization & Persistence", () => {
    it("should throttle save to localStorage", async () => {
      vi.useFakeTimers();
      const setItemSpy = vi.spyOn(localStorage, "setItem");

      MockDB.addTransaction({ id: "t1", title: "Test", amount: 100 } as Txn);
      MockDB.addTransaction({ id: "t2", title: "Test 2", amount: 200 } as Txn);

      expect(setItemSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(setItemSpy).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("A2. Budget Operations", () => {
    it("should return budget months sorted DESC", () => {
      MockDB.setBudget("2025-01", { id: "b1", month: "2025-01" } as Budget);
      MockDB.setBudget("2025-03", { id: "b3", month: "2025-03" } as Budget);
      MockDB.setBudget("2025-02", { id: "b2", month: "2025-02" } as Budget);

      const months = MockDB.listBudgetMonths();
      expect(months).toEqual(["2025-03", "2025-02", "2025-01"]);
    });

    it("should return a cloned budget object", () => {
      const b = { id: "b1", month: "2025-01", totalLimit: 1000 } as Budget;
      MockDB.setBudget("2025-01", b);

      const retrieved = MockDB.getBudget("2025-01");
      expect(retrieved).not.toBe(b); // Different reference
      expect(retrieved).toEqual(b); // Same value

      if (retrieved) retrieved.totalLimit = 2000;
      expect(MockDB.getBudget("2025-01")?.totalLimit).toBe(1000); // Original shouldn't change
    });
  });

  describe("A3. Expense Operations", () => {
    it("should add transaction to the front (newest first)", () => {
      const t1 = {
        id: "t1",
        title: "Old",
        amount: 10,
        date: "2025-01-01",
      } as Txn;
      const t2 = {
        id: "t2",
        title: "New",
        amount: 20,
        date: "2025-01-02",
      } as Txn;

      MockDB.addTransaction(t1);
      MockDB.addTransaction(t2);

      const txns = MockDB.transactions;
      expect(txns[0].id).toBe("t2");
      expect(txns[1].id).toBe("t1");
    });

    it("should soft delete and restore transactions", () => {
      const t1 = {
        id: "t1",
        title: "Test",
        amount: 100,
        deletedAt: null,
      } as Txn;
      MockDB.addTransaction(t1);

      // Soft delete
      MockDB.softDeleteTransactions(["t1"]);
      const tSoftDeleted = MockDB.transactions.find((t) => t.id === "t1");
      expect(tSoftDeleted?.deletedAt).not.toBeNull();

      // Restore
      MockDB.restoreTransactions(["t1"]);
      const tRestored = MockDB.transactions.find((t) => t.id === "t1");
      expect(tRestored?.deletedAt).toBeNull();
    });

    it("should hard delete transactions", () => {
      const t1 = { id: "t1", title: "Test", amount: 100 } as Txn;
      MockDB.addTransaction(t1);

      MockDB.deleteTransactions(["t1"]);
      const tMissing = MockDB.transactions.find((t) => t.id === "t1");
      expect(tMissing).toBeUndefined();
    });
  });
});
