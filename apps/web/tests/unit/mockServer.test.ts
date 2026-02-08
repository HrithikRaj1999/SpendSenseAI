import { describe, it, expect, beforeEach } from "vitest";
import { mockFetch } from "@/mocks/mockServer";
import { MockDB } from "@/mocks/mockDb";
import type { Txn } from "@/features/expenses/types";

describe("MockServer Unit Tests", () => {
  beforeEach(() => {
    // Reset DB state (simplification as discussed)
    const months = MockDB.listBudgetMonths();
    months.forEach((m) => MockDB.deleteBudget(m));
    const txns = MockDB.transactions;
    if (txns.length > 0) MockDB.deleteTransactions(txns.map((t) => t.id));
  });

  describe("B1. Route Matching", () => {
    it("should return 404 for unknown routes", async () => {
      await expect(
        mockFetch({ url: "/unknown", method: "GET" }),
      ).rejects.toEqual({
        status: 404,
        message: "Not Found",
      });
    });

    it("should match /expenses correctly", async () => {
      const res = await mockFetch({ url: "/expenses", method: "GET" });
      expect(res).toHaveProperty("rows");
    });
  });

  describe("B2. Expenses Query Behavior", () => {
    beforeEach(() => {
      // Seed some data
      MockDB.addTransaction({
        id: "t1",
        title: "Lunch",
        amount: 50,
        category: "Food",
        paymentMethod: "Cash",
        date: "2025-01-15T12:00:00Z",
      } as Txn);
      MockDB.addTransaction({
        id: "t2",
        title: "Uber",
        amount: 30,
        category: "Transport",
        paymentMethod: "Card",
        date: "2025-01-10T12:00:00Z",
      } as Txn);
      MockDB.addTransaction({
        id: "t3",
        title: "Dinner",
        amount: 80,
        category: "Food",
        paymentMethod: "Card",
        date: "2025-02-01T12:00:00Z",
      } as Txn);
    });

    it("should filter by category", async () => {
      const res = await mockFetch({
        url: "/expenses?category=Food",
        method: "GET",
      });
      expect(res.rows).toHaveLength(2);
      expect(res.rows[0].title).toBe("Dinner"); // Sorted desc by date
    });

    it("should search case-insensitive", async () => {
      const res = await mockFetch({
        url: "/expenses?search=lunch",
        method: "GET",
      });
      expect(res.rows).toHaveLength(1);
      expect(res.rows[0].title).toBe("Lunch");
    });

    it("should sort transactions", async () => {
      const res = await mockFetch({
        url: "/expenses?sort=amount&sortOrder=asc",
        method: "GET",
      });
      expect(res.rows[0].amount).toBe(30); // Uber
      expect(res.rows[2].amount).toBe(80); // Dinner
    });

    it("should paginate transactions", async () => {
      const res = await mockFetch({
        url: "/expenses?limit=1&page=1",
        method: "GET",
      });
      expect(res.rows).toHaveLength(1);
      // Default sort is date desc, so t3 (Feb) comes first
      expect(res.rows[0].id).toBe("t3");
      expect(res.total).toBe(3);
    });
  });

  describe("B3. Bulk Endpoints", () => {
    beforeEach(() => {
      MockDB.addTransaction({
        id: "t1",
        title: "A",
        amount: 10,
        deletedAt: null,
      } as Txn);
      MockDB.addTransaction({
        id: "t2",
        title: "B",
        amount: 20,
        deletedAt: null,
      } as Txn);
    });

    it("should soft delete multiple items", async () => {
      await mockFetch({
        url: "/expenses/soft-delete",
        method: "POST",
        body: { ids: ["t1", "t2"] },
      });
      const t1 = MockDB.getTransaction("t1");
      const t2 = MockDB.getTransaction("t2");
      expect(t1?.deletedAt).not.toBeNull();
      expect(t2?.deletedAt).not.toBeNull();
    });
  });
});
