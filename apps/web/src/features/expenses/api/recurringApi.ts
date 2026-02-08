import { createApi } from "@reduxjs/toolkit/query/react";
import type { RecurringItem } from "@/features/expenses/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const recurringApi = createApi({
  reducerPath: "recurringApi",
  baseQuery: mockBaseQuery,
  tagTypes: ["Recurring"],
  endpoints: (builder) => ({
    getRecurring: builder.query<RecurringItem[], void>({
      query: () => ({ url: "/expenses/recurring", method: "GET" }),
      providesTags: ["Recurring"],
    }),
  }),
});

export const { useGetRecurringQuery } = recurringApi;
