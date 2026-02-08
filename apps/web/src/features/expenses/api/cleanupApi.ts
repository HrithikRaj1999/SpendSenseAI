import { createApi } from "@reduxjs/toolkit/query/react";
import type { DuplicatePair } from "@/features/expenses/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const cleanupApi = createApi({
  reducerPath: "cleanupApi",
  baseQuery: mockBaseQuery,
  tagTypes: ["Cleanup"],
  endpoints: (builder) => ({
    getDuplicates: builder.query<DuplicatePair[], void>({
      query: () => ({ url: "/expenses/cleanup/duplicates", method: "GET" }),
      providesTags: ["Cleanup"],
    }),
  }),
});

export const { useGetDuplicatesQuery } = cleanupApi;
