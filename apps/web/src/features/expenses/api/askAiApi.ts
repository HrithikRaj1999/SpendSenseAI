import { createApi } from "@reduxjs/toolkit/query/react";
import type { AskAiDTO } from "@/features/expenses/types";
import { baseQuery } from "@/app/store/baseQuery";

export const askAiApi = createApi({
  reducerPath: "askAiApi",
  baseQuery: baseQuery,
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
