import { configureStore } from "@reduxjs/toolkit";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";
import { expensesApi } from "@/features/expenses/api/expensesApi";
import { insightsApi } from "@/features/expenses/api/insightsApi";
import { recurringApi } from "@/features/expenses/api/recurringApi";
import { cleanupApi } from "@/features/expenses/api/cleanupApi";
import { askAiApi } from "@/features/expenses/api/askAiApi";
import { budgetsApi } from "@/features/budgets/api/budgetsApi"; // ✅ add

export const apis = [
  dashboardApi,
  expensesApi,
  insightsApi,
  recurringApi,
  cleanupApi,
  askAiApi,
  budgetsApi,
] as const;

export const store = configureStore({
  reducer: {
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [insightsApi.reducerPath]: insightsApi.reducer,
    [recurringApi.reducerPath]: recurringApi.reducer,
    [cleanupApi.reducerPath]: cleanupApi.reducer,
    [askAiApi.reducerPath]: askAiApi.reducer,
    [budgetsApi.reducerPath]: budgetsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dashboardApi.middleware,
      expensesApi.middleware,
      insightsApi.middleware,
      recurringApi.middleware,
      cleanupApi.middleware,
      askAiApi.middleware,
      budgetsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
