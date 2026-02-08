import { createApi } from "@reduxjs/toolkit/query/react";
import type { DashboardDTO } from "../utils/types";
import { baseQuery } from "@/app/store/baseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQuery,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardDTO, { month: string }>({
      query: ({ month }) => ({
        url: "/dashboard",
        params: { month },
      }),
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
