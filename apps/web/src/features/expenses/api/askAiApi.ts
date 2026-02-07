import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AskAiDTO } from "@/app/dummy/db";
import { askAi } from "@/app/dummy/db";

export const askAiApi = createApi({
  reducerPath: "askAiApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["AskAI"],
  endpoints: (builder) => ({
    askAi: builder.mutation<AskAiDTO, { question: string }>({
      async queryFn({ question }) {
        const data = await askAi(question);
        return { data };
      },
    }),
  }),
});

export const { useAskAiMutation } = askAiApi;
