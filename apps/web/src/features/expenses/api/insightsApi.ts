import { createApi } from "@reduxjs/toolkit/query/react";
import type { ExpenseInsightsDTO } from "@/features/expenses/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const insightsApi = createApi({
  reducerPath: "insightsApi",
  baseQuery: mockBaseQuery,
  tagTypes: ["ExpenseInsights"],
  endpoints: (builder) => ({
    getExpenseInsights: builder.query<ExpenseInsightsDTO, { month: string }>({
      query: ({ month }) => ({
        url: "/expenses/insights",
        method: "GET",
        params: { month },
      }),
      providesTags: ["ExpenseInsights"],
    }),
  }),
});

export const { useGetExpenseInsightsQuery } = insightsApi;
