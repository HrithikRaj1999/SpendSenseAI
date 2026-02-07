export type Txn = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string; // ISO
  paymentMethod: "UPI" | "Card" | "NetBanking" | "Cash";
};

export type Timeframe = "month" | "quarter" | "year" | "custom";

export type GetTransactionsArgs = {
  timeframe: Timeframe;
  month?: string; // "2026-02"
  quarter?: string; // "2026-Q1"
  year?: number; // 2026
  from?: string; // ISO
  to?: string; // ISO

  search?: string;
  category?: string;
  paymentMethod?: string; // "All" or specific method

  page?: number;
  limit?: number;
};

export type TransactionsDTO = {
  rows: Txn[];
  total: number;
};
