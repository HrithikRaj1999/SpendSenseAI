import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authGetAccessToken } from "@/features/auth/utils/auth";

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await authGetAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});
