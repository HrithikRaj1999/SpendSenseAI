import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CreateExpenseInput,
  Txn,
  GetTransactionsArgs,
  TransactionsDTO,
} from "@/features/expenses/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: mockBaseQuery,
  tagTypes: ["Expenses", "Trash", "Dashboard", "Budgets"],
  endpoints: (b) => ({
    getExpenses: b.query<TransactionsDTO, GetTransactionsArgs>({
      query: (args) => ({
        url: "/expenses",
        method: "GET",
        params: args as any,
      }),
      providesTags: (res) =>
        res
          ? [
              { type: "Expenses", id: "LIST" },
              ...res.rows.map((r) => ({ type: "Expenses" as const, id: r.id })),
            ]
          : [{ type: "Expenses", id: "LIST" }],
    }),
    createExpense: b.mutation<Txn, CreateExpenseInput>({
      query: (body) => ({
        url: "/expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses", "Dashboard", "Budgets"],
    }),
    updateExpense: b.mutation<Txn, { id: string; patch: Partial<Txn> }>({
      query: ({ id, patch }) => ({
        url: `/expenses/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Expenses", id: arg.id },
        { type: "Expenses", id: "LIST" },
        "Dashboard",
        "Budgets",
      ],
    }),

    // soft delete by ids
    softDeleteExpenses: b.mutation<
      { ok: true; deleted: number },
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/expenses/soft-delete",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Trash", id: "LIST" },
        "Dashboard",
        "Budgets",
      ],
    }),

    restoreExpenses: b.mutation<
      { ok: true; restored: number },
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/expenses/restore",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Trash", id: "LIST" },
        "Dashboard",
        "Budgets",
      ],
    }),

    // Bulk update by IDs
    bulkUpdateExpenses: b.mutation<
      { ok: true; updated: number },
      { ids: string[]; patch: Partial<Txn> }
    >({
      query: (body) => ({
        url: "/expenses/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses", "Dashboard", "Budgets"],
    }),

    // Soft delete by filter
    softDeleteByFilter: b.mutation<
      { ok: true; deleted: number },
      { args: GetTransactionsArgs; excludeIds?: string[] }
    >({
      query: (body) => ({
        url: "/expenses/soft-delete/filter",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses", "Trash", "Dashboard", "Budgets"],
    }),

    // Bulk update by filter
    bulkUpdateByFilter: b.mutation<
      { ok: true; updated: number },
      { args: GetTransactionsArgs; patch: Partial<Txn>; excludeIds?: string[] }
    >({
      query: (body) => ({
        url: "/expenses/bulk-update/filter",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses", "Dashboard", "Budgets"],
    }),

    getTrash: b.query<
      TransactionsDTO,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/expenses/trash",
        method: "GET",
        params,
      }),
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
      query: (body) => ({
        url: "/expenses/hard-delete",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Trash", id: "LIST" },
        { type: "Expenses", id: "LIST" },
      ],
    }),

    emptyTrash: b.mutation<{ ok: true; removed: number }, void>({
      async queryFn() {
        return { data: { ok: true, removed: 0 } };
      },
      invalidatesTags: ["Trash", "Expenses"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useUpdateExpenseMutation,
  useCreateExpenseMutation,
  useSoftDeleteExpensesMutation,
  useRestoreExpensesMutation,
  useGetTrashQuery,
  useHardDeleteExpensesMutation,
  useEmptyTrashMutation,
  useBulkUpdateExpensesMutation,
  useSoftDeleteByFilterMutation,
  useBulkUpdateByFilterMutation,
} = expensesApi;
