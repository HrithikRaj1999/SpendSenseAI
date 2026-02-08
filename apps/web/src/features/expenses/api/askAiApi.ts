import { createApi } from "@reduxjs/toolkit/query/react";
import type { AskAiDTO } from "@/features/expenses/types";
import { mockBaseQuery } from "@/app/store/mockBaseQuery";

export const askAiApi = createApi({
  reducerPath: "askAiApi",
  baseQuery: mockBaseQuery,
  tagTypes: ["AskAI"],
  endpoints: (builder) => ({
    askAi: builder.mutation<AskAiDTO, { question: string }>({
      query: (body) => ({
        url: "/expenses/ask-ai",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAskAiMutation } = askAiApi;
