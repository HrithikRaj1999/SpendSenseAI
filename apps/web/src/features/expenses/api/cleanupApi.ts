import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DuplicatePair } from "@/app/dummy/db";
import { getDuplicateSuggestions } from "@/app/dummy/db";

export const cleanupApi = createApi({
  reducerPath: "cleanupApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Cleanup"],
  endpoints: (builder) => ({
    getDuplicates: builder.query<DuplicatePair[], void>({
      async queryFn() {
        const data = await getDuplicateSuggestions();
        return { data };
      },
      providesTags: ["Cleanup"],
    }),
  }),
});

export const { useGetDuplicatesQuery } = cleanupApi;
