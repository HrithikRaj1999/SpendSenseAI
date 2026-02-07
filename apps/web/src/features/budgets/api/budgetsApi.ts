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
  BudgetMode,
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
  mockCreateMonthBudget,
  mockUpdateBudget,
  mockListBudgetMonths,
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
    if (req.method === "POST" && req.url === "/budgets/create") {
      const data = await mockCreateMonthBudget(req.body);
      return { data };
    }

    // PATCH /budgets/update
    if (req.method === "PATCH" && req.url === "/budgets/update") {
      const data = await mockUpdateBudget(req.body);
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
    if (req.method === "GET" && req.url === "/budgets/months") {
      const data = await mockListBudgetMonths();
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
  tagTypes: [
    "Budget",
    "Categories",
    "Alerts",
    "Guardrails",
    "Goals",
    "WhatIf",
    "BudgetMonths",
  ],
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
    createMonthBudget: builder.mutation<
      BudgetDTO,
      {
        month: BudgetMonth;
        totalLimit: number;
        mode?: BudgetMode;
        rolloverUnused?: boolean;
      }
    >({
      query: (body) => ({ url: "/budgets/create", method: "POST", body }),
      invalidatesTags: [
        "Budget",
        "Categories",
        "Alerts",
        "Guardrails",
        "Goals",
        "BudgetMonths",
      ],
    }),
    listBudgetMonths: builder.query<{ months: string[] }, void>({
      query: () => ({ url: "/budgets/months", method: "GET" }),
      providesTags: ["BudgetMonths"],
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
      query: (body) => ({ url: "/budgets/update", method: "PATCH", body }),
      invalidatesTags: [
        "Budget",
        "Categories",
        "Alerts",
        "Guardrails",
        "Goals",
      ],
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
  useUpsertCategoryBudgetMutation,
  useToggleAlertRuleMutation,
  useCreateAlertRuleMutation,
  useToggleGuardrailMutation,
  useCreateGuardrailMutation,
  useCreateGoalMutation,
  useSimulateWhatIfMutation,
  useGetActiveBudgetQuery,
  useGetBudgetByMonthQuery,
  useCreateMonthBudgetMutation,
  useUpdateBudgetMutation,
  useListBudgetMonthsQuery,
} = budgetsApi;
