import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { GetTransactionsArgs, TransactionsDTO } from "../types";
import { queryTransactions } from "@/app/dummy/db";

export const transactionsApi = createApi({
  reducerPath: "transactionsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Transactions"],
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionsDTO, GetTransactionsArgs>({
      async queryFn(args) {
        const data = await queryTransactions(args);
        return { data };
      },
      providesTags: ["Transactions"],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionsApi;
