import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RecurringItem } from "@/app/dummy/db";
import { getRecurring } from "@/app/dummy/db";

export const recurringApi = createApi({
  reducerPath: "recurringApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Recurring"],
  endpoints: (builder) => ({
    getRecurring: builder.query<RecurringItem[], void>({
      async queryFn() {
        const data = await getRecurring();
        return { data };
      },
      providesTags: ["Recurring"],
    }),
  }),
});

export const { useGetRecurringQuery } = recurringApi;
