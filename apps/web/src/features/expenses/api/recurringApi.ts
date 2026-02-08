import { createApi } from "@reduxjs/toolkit/query/react";
import type { RecurringItem } from "@/features/expenses/types";
import { baseQuery } from "@/app/store/baseQuery";

export const recurringApi = createApi({
  reducerPath: "recurringApi",
  baseQuery: baseQuery,
  tagTypes: ["Recurring"],
  endpoints: (builder) => ({
    getRecurring: builder.query<RecurringItem[], void>({
      query: () => ({ url: "/expenses/recurring", method: "GET" }),
      providesTags: ["Recurring"],
    }),
  }),
});

export const { useGetRecurringQuery } = recurringApi;
