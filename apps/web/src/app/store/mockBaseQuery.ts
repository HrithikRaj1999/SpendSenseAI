import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { mockFetch } from "@/mocks/mockServer";

export const mockBaseQuery: BaseQueryFn<
  {
    url: string;
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: any;
    params?: Record<string, any>;
  },
  unknown,
  { status: number; message: string }
> = async ({ url, method = "GET", body, params }) => {
  try {
    // Construct full URL with params if they exist (for GET requests mostly)
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += `?${qs}`;
      }
    }

    const data = await mockFetch({
      url: fullUrl,
      method,
      body,
    });

    // Deep clone to avoid RTK Object.freeze issues
    // Using structuredClone if available or JSON parse/stringify
    const clonedData =
      typeof structuredClone === "function"
        ? structuredClone(data)
        : JSON.parse(JSON.stringify(data));

    return { data: clonedData };
  } catch (error: any) {
    console.error("Mock API Error:", error);
    return {
      error: {
        status: error.status || 500,
        message: error.message || "Internal Server Error",
      },
    };
  }
};
