import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateExpenseInput, Txn } from "@/features/expenses/types";
import {
  queryTransactions,
  updateExpense,
  softDeleteExpenses,
  restoreExpenses,
  softDeleteByFilter,
  bulkUpdateExpenses,
  GetTransactionsArgs,
  TransactionsDTO,
  bulkUpdateByFilter,
  hardDeleteExpenses,
  listTrash,
  createExpense,
} from "@/app/dummy/db";

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Expenses", "Trash"],
  endpoints: (b) => ({
    getExpenses: b.query<TransactionsDTO, GetTransactionsArgs>({
      async queryFn(args) {
        try {
          const data = await queryTransactions(args);
          return { data };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      providesTags: (res) =>
        res
          ? [
              { type: "Expenses", id: "LIST" },
              ...res.rows.map((r) => ({ type: "Expenses" as const, id: r.id })),
            ]
          : [{ type: "Expenses", id: "LIST" }],
    }),
    createExpense: b.mutation<Txn, CreateExpenseInput>({
      async queryFn(input) {
        const data = await createExpense(input);
        return { data };
      },
      invalidatesTags: ["Expenses"],
    }),
    updateExpense: b.mutation<Txn, { id: string; patch: Partial<Txn> }>({
      async queryFn({ id, patch }) {
        try {
          const data = await updateExpense(id, patch);
          return { data };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: "Expenses", id: arg.id },
        { type: "Expenses", id: "LIST" },
      ],
    }),

    // soft delete by ids
    softDeleteExpenses: b.mutation<
      { ok: true; deleted: number },
      { ids: string[] }
    >({
      async queryFn({ ids }) {
        try {
          const data = await softDeleteExpenses(ids);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Trash", id: "LIST" },
      ],
    }),

    restoreExpenses: b.mutation<
      { ok: true; restored: number },
      { ids: string[] }
    >({
      async queryFn({ ids }) {
        try {
          const data = await restoreExpenses(ids);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Trash", id: "LIST" },
      ],
    }),

    // bulk update by ids
    bulkUpdateExpenses: b.mutation<
      { ok: true; updated: number },
      { ids: string[]; patch: Partial<Txn> }
    >({
      async queryFn({ ids, patch }) {
        try {
          const data = await bulkUpdateExpenses(ids, patch);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),

    // ✅ select all across pages (operate on FILTER)
    softDeleteByFilter: b.mutation<
      { ok: true; deleted: number },
      { args: GetTransactionsArgs; excludeIds?: string[] }
    >({
      async queryFn({ args, excludeIds }) {
        try {
          const data = await softDeleteByFilter(args, excludeIds ?? []);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Trash", id: "LIST" },
      ],
    }),

    bulkUpdateByFilter: b.mutation<
      { ok: true; updated: number },
      { args: GetTransactionsArgs; patch: Partial<Txn>; excludeIds?: string[] }
    >({
      async queryFn({ args, patch, excludeIds }) {
        try {
          const data = await bulkUpdateByFilter(args, patch, excludeIds ?? []);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
    getTrash: b.query<
      TransactionsDTO,
      { search?: string; page?: number; limit?: number }
    >({
      async queryFn({ search = "", page = 1, limit = 25 }) {
        try {
          const res = await listTrash(); // returns all deleted rows
          let rows = res.rows;

          if (search.trim()) {
            const s = search.toLowerCase();
            rows = rows.filter(
              (r) =>
                r.title.toLowerCase().includes(s) ||
                r.category.toLowerCase().includes(s) ||
                r.paymentMethod.toLowerCase().includes(s),
            );
          }

          const total = rows.length;
          const start = (Math.max(1, page) - 1) * limit;
          const pageRows = rows.slice(start, start + limit);

          return { data: { rows: pageRows, total } };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      providesTags: (res) =>
        res
          ? [
              { type: "Trash", id: "LIST" },
              ...res.rows.map((r) => ({ type: "Trash" as const, id: r.id })),
            ]
          : [{ type: "Trash", id: "LIST" }],
    }),

    hardDeleteExpenses: b.mutation<
      { ok: true; removed: number },
      { ids: string[] }
    >({
      async queryFn({ ids }) {
        try {
          const data = await hardDeleteExpenses(ids);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [
        { type: "Trash", id: "LIST" },
        { type: "Expenses", id: "LIST" },
      ],
    }),

    emptyTrash: b.mutation<{ ok: true; removed: number }, void>({
      async queryFn() {
        try {
          const res = await listTrash();
          const ids = res.rows.map((r) => r.id);
          const data = await hardDeleteExpenses(ids);
          return { data: data as any };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } as any };
        }
      },
      invalidatesTags: [
        { type: "Trash", id: "LIST" },
        { type: "Expenses", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useUpdateExpenseMutation,
  useCreateExpenseMutation,
  useSoftDeleteExpensesMutation,
  useRestoreExpensesMutation,
  useBulkUpdateExpensesMutation,
  useSoftDeleteByFilterMutation,
  useGetTrashQuery,
  useHardDeleteExpensesMutation,
  useEmptyTrashMutation,
  useBulkUpdateByFilterMutation,
} = expensesApi;
