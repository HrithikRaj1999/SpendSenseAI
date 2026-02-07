import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ExpenseInsightsDTO } from "@/app/dummy/db";
import { getExpenseInsights } from "@/app/dummy/db";

export const insightsApi = createApi({
  reducerPath: "insightsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["ExpenseInsights"],
  endpoints: (builder) => ({
    getExpenseInsights: builder.query<ExpenseInsightsDTO, { month: string }>({
      async queryFn({ month }) {
        const data = await getExpenseInsights(month);
        return { data };
      },
      providesTags: ["ExpenseInsights"],
    }),
  }),
});

export const { useGetExpenseInsightsQuery } = insightsApi;
