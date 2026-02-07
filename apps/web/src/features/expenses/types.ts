export type PaymentMethod = "UPI" | "Card" | "NetBanking" | "Cash";

export type Txn = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string; // ISO
  paymentMethod: PaymentMethod;

  deletedAt?: string | null;
  receiptUrl?: string | null;
};

export type CreateExpenseInput = Omit<Txn, "id" | "deletedAt">;

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
export type Timeframe = "month" | "quarter" | "year" | "custom";

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string; // ISO
  paymentMethod: string;
};

export type GetExpensesArgs = {
  timeframe: Timeframe;

  month?: string; // YYYY-MM
  quarter?: string; // YYYY-Q1..Q4
  year?: number;
  from?: string; // ISO
  to?: string; // ISO

  search?: string;
  category?: string; // "All" or category
  paymentMethod?: string; // "All" or method

  sortField?: "date" | "amount" | "title" | "category" | "paymentMethod";
  sortOrder?: "asc" | "desc";

  page: number;
  limit: number;
};

export type ExpensesDTO = {
  rows: Expense[];
  total: number;
};
