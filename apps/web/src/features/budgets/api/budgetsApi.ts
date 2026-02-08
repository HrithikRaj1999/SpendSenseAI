import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BudgetDTO,
  BudgetMonth,
  BudgetMode,
  CategoryBudget,
} from "../utils/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const budgetsApi = createApi({
  reducerPath: "budgetsApi",
  baseQuery: mockBaseQuery,
  tagTypes: [
    "Budget",
    "Categories",
    "Alerts",
    "Guardrails",
    "Goals",
    "WhatIf",
    "BudgetMonths",
    "Dashboard",
  ],
  endpoints: (builder) => ({
    getBudgetByMonth: builder.query<BudgetDTO, { month: string }>({
      query: ({ month }) => ({ url: `/budgets/${month}`, method: "GET" }),
      providesTags: (_r, _e, arg) => [
        { type: "Budget", id: arg.month },
        "Categories",
        "Alerts",
        "Guardrails",
        "Goals",
      ],
    }),

    listBudgetMonths: builder.query<{ months: string[] }, void>({
      query: () => ({ url: "/budgets/months", method: "GET" }),
      providesTags: ["BudgetMonths"],
    }),

    createMonthBudget: builder.mutation<
      BudgetDTO,
      {
        month: BudgetMonth;
        totalLimit: number;
        mode?: BudgetMode;
        rolloverUnused?: boolean;
      }
    >({
      query: (body) => ({ url: "/budgets", method: "POST", body }),
      invalidatesTags: ["Budget", "BudgetMonths", "Dashboard"],
    }),

    updateBudget: builder.mutation<
      BudgetDTO,
      {
        month: BudgetMonth;
        patch: {
          totalLimit?: number;
          mode?: BudgetMode;
          rolloverUnused?: boolean;
        };
      }
    >({
      query: ({ month, patch }) => ({
        url: `/budgets/${month}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Budget", id: arg.month },
        "Dashboard",
      ],
    }),

    cloneBudget: builder.mutation<
      BudgetDTO,
      { fromMonth: string; toMonth: string }
    >({
      query: ({ fromMonth, toMonth }) => ({
        url: `/budgets/${fromMonth}/clone`,
        method: "POST",
        body: { toMonth },
      }),
      invalidatesTags: ["Budget", "BudgetMonths", "Dashboard"],
    }),

    resetBudget: builder.mutation<BudgetDTO, { month: string }>({
      query: ({ month }) => ({
        url: `/budgets/${month}/reset`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Budget", id: arg.month },
        "Dashboard",
      ],
    }),

    // --- Sub-resources (Categories, Alerts, etc.) ---
    upsertCategoryBudget: builder.mutation<
      CategoryBudget,
      { month: BudgetMonth; category: string; limit: number }
    >({
      query: (body) => ({
        url: "/budgets/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories", "Budget"],
    }),

    toggleAlertRule: builder.mutation<
      any, // AlertRule
      { id: string; enabled: boolean }
    >({
      query: (body) => ({
        url: "/budgets/alerts/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),

    createAlertRule: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/budgets/alerts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),

    toggleGuardrail: builder.mutation<
      any, // GuardrailRule
      { id: string; enabled: boolean }
    >({
      query: (body) => ({
        url: "/budgets/guardrails/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Guardrails"],
    }),

    createGuardrail: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/budgets/guardrails",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Guardrails"],
    }),

    createGoal: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/budgets/goals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goals"],
    }),

    simulateWhatIf: builder.mutation<
      BudgetDTO,
      { month: BudgetMonth; scenario: any }
    >({
      query: (body) => ({
        url: "/budgets/what-if",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WhatIf"],
    }),
  }),
});

export const {
  useGetBudgetByMonthQuery,
  useListBudgetMonthsQuery,
  useCreateMonthBudgetMutation,
  useUpdateBudgetMutation,
  useCloneBudgetMutation,
  useResetBudgetMutation,
  useUpsertCategoryBudgetMutation,
  useToggleAlertRuleMutation,
  useCreateAlertRuleMutation,
  useToggleGuardrailMutation,
  useCreateGuardrailMutation,
  useCreateGoalMutation,
  useSimulateWhatIfMutation,
} = budgetsApi;

// Shim for getting active budget from URL
import { useSearchParams } from "react-router-dom";

export const useGetActiveBudgetQuery = () => {
  const [searchParams] = useSearchParams();
  const month =
    searchParams.get("month") || new Date().toISOString().slice(0, 7);
  return useGetBudgetByMonthQuery({ month });
};
