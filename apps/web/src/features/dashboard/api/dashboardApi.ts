import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { DashboardDTO } from "../utils/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const dummyDashboard: DashboardDTO = {
  summary: {
    monthSpend: 24890,
    monthBudget: 35000,
    savingsEstimate: 10110,
    biggestCategory: "Food & Dining",
  },
  trend: [
    { date: "2026-02-01", amount: 900 },
    { date: "2026-02-03", amount: 1200 },
    { date: "2026-02-05", amount: 450 },
    { date: "2026-02-07", amount: 2100 },
    { date: "2026-02-10", amount: 780 },
    { date: "2026-02-12", amount: 1350 },
    { date: "2026-02-15", amount: 950 },
    { date: "2026-02-18", amount: 1800 },
    { date: "2026-02-21", amount: 650 },
    { date: "2026-02-24", amount: 1700 },
    { date: "2026-02-26", amount: 920 },
  ],
  categories: [
    { id: "c1", name: "Food & Dining", amount: 8200 },
    { id: "c2", name: "Transport", amount: 4100 },
    { id: "c3", name: "Shopping", amount: 5200 },
    { id: "c4", name: "Bills", amount: 3900 },
    { id: "c5", name: "Entertainment", amount: 2490 },
    { id: "c6", name: "Health", amount: 1000 },
  ],
  recent: [
    {
      id: "e1",
      title: "Swiggy order",
      category: "Food & Dining",
      amount: 389,
      date: "2026-02-06T19:10:00.000Z",
      paymentMethod: "UPI",
    },
    {
      id: "e2",
      title: "Metro card top-up",
      category: "Transport",
      amount: 500,
      date: "2026-02-06T09:40:00.000Z",
      paymentMethod: "Card",
    },
    {
      id: "e3",
      title: "Electricity bill",
      category: "Bills",
      amount: 1450,
      date: "2026-02-05T13:15:00.000Z",
      paymentMethod: "NetBanking",
    },
    {
      id: "e4",
      title: "Gym protein",
      category: "Health",
      amount: 999,
      date: "2026-02-04T18:20:00.000Z",
      paymentMethod: "UPI",
    },
    {
      id: "e5",
      title: "Amazon shopping",
      category: "Shopping",
      amount: 2199,
      date: "2026-02-03T21:05:00.000Z",
      paymentMethod: "Card",
    },
  ],
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardDTO, void>({
      // queryFn gives you full control + easy dummy data
      async queryFn() {
        // simulate real API latency but keep UI smooth
        await sleep(450);
        return { data: dummyDashboard };
      },
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 60, // cache for 60s
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
