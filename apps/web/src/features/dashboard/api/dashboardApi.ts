import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DashboardDTO } from "../utils/types";
import { getDashboardDTO } from "@/app/dummy/db";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardDTO, void>({
      async queryFn() {
        return { data: getDashboardDTO() };
      },
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
