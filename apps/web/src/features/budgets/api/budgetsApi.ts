import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BudgetDTO,
  BudgetMonth,
  CategoryBudget,
  AlertRule,
  GuardrailRule,
  Goal,
  WhatIfScenario,
} from "../utils/types";
import {
  mockGetActiveBudget,
  mockGetBudgetByMonth,
  mockUpsertCategoryBudget,
  mockToggleAlertRule,
  mockCreateAlertRule,
  mockToggleGuardrail,
  mockCreateGuardrail,
  mockCreateGoal,
  mockSimulateWhatIf,
} from "./bugdetsMockServer";

type MockArg =
  | string
  | {
      url: string;
      method?: string;
      body?: any;
    };

const mockBaseQuery: BaseQueryFn<
  MockArg,
  unknown,
  { status: number; data: any }
> = async (arg) => {
  try {
    const req =
      typeof arg === "string"
        ? { url: arg, method: "GET", body: undefined }
        : {
            url: arg.url,
            method: (arg.method ?? "GET").toUpperCase(),
            body: arg.body,
          };

    // mimic network latency
    // (handlers also have sleeps; keep this 0 or small)
    // await new Promise((r) => setTimeout(r, 30));

    // ROUTE: GET /budgets/active
    if (req.method === "GET" && req.url === "/budgets/active") {
      const data = await mockGetActiveBudget();
      return { data };
    }

    // ROUTE: GET /budgets/:month
    if (req.method === "GET" && req.url.startsWith("/budgets/")) {
      const month = decodeURIComponent(req.url.replace("/budgets/", ""));
      const data = await mockGetBudgetByMonth(month as BudgetMonth);
      return { data };
    }

    // ROUTE: POST /budgets/categories
    if (req.method === "POST" && req.url === "/budgets/categories") {
      const data = await mockUpsertCategoryBudget(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/alerts
    if (req.method === "POST" && req.url === "/budgets/alerts") {
      const data = await mockCreateAlertRule(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/alerts/toggle
    if (req.method === "POST" && req.url === "/budgets/alerts/toggle") {
      const data = await mockToggleAlertRule(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/guardrails
    if (req.method === "POST" && req.url === "/budgets/guardrails") {
      const data = await mockCreateGuardrail(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/guardrails/toggle
    if (req.method === "POST" && req.url === "/budgets/guardrails/toggle") {
      const data = await mockToggleGuardrail(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/goals
    if (req.method === "POST" && req.url === "/budgets/goals") {
      const data = await mockCreateGoal(req.body);
      return { data };
    }

    // ROUTE: POST /budgets/what-if
    if (req.method === "POST" && req.url === "/budgets/what-if") {
      const data = await mockSimulateWhatIf(req.body);
      return { data };
    }

    return {
      error: {
        status: 404,
        data: { message: `No mock route for ${req.method} ${req.url}` },
      },
    };
  } catch (e: any) {
    return {
      error: { status: 500, data: { message: e?.message ?? "Mock error" } },
    };
  }
};

const realBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
});

const baseQuery = import.meta.env.DEV ? mockBaseQuery : realBaseQuery;

export const budgetsApi = createApi({
  reducerPath: "budgetsApi",
  baseQuery,
  tagTypes: ["Budget", "Categories", "Alerts", "Guardrails", "Goals", "WhatIf"],
  endpoints: (builder) => ({
    getActiveBudget: builder.query<BudgetDTO, void>({
      query: () => "/budgets/active",
      providesTags: ["Budget", "Categories", "Alerts", "Guardrails", "Goals"],
    }),

    getBudgetByMonth: builder.query<BudgetDTO, BudgetMonth>({
      query: (month) => `/budgets/${encodeURIComponent(month)}`,
      providesTags: ["Budget", "Categories", "Alerts", "Guardrails", "Goals"],
    }),

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
      AlertRule,
      { id: string; enabled: boolean }
    >({
      query: (body) => ({
        url: "/budgets/alerts/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),

    createAlertRule: builder.mutation<AlertRule, Partial<AlertRule>>({
      query: (body) => ({
        url: "/budgets/alerts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),

    toggleGuardrail: builder.mutation<
      GuardrailRule,
      { id: string; enabled: boolean }
    >({
      query: (body) => ({
        url: "/budgets/guardrails/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Guardrails"],
    }),

    createGuardrail: builder.mutation<GuardrailRule, Partial<GuardrailRule>>({
      query: (body) => ({
        url: "/budgets/guardrails",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Guardrails"],
    }),

    createGoal: builder.mutation<Goal, Partial<Goal>>({
      query: (body) => ({
        url: "/budgets/goals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goals"],
    }),

    simulateWhatIf: builder.mutation<
      BudgetDTO,
      { month: BudgetMonth; scenario: WhatIfScenario }
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
  useGetActiveBudgetQuery,
  useGetBudgetByMonthQuery,
  useUpsertCategoryBudgetMutation,
  useToggleAlertRuleMutation,
  useCreateAlertRuleMutation,
  useToggleGuardrailMutation,
  useCreateGuardrailMutation,
  useCreateGoalMutation,
  useSimulateWhatIfMutation,
} = budgetsApi;
