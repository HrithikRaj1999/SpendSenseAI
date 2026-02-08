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
  description?: string | null;
  merchant?: string | null;
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

// --- Added for specific features ---

export type RecurringItem = {
  id: string;
  title: string;
  category: string;
  avgAmount: number;
  cadence: "Monthly" | "Weekly";
  nextDue: string; // ISO date
  lastSeen: string; // ISO date
  paymentMethod: PaymentMethod;
};

export type DuplicatePair = {
  a: Txn;
  b: Txn;
  confidence: number; // 0..1
  reason: string;
};

export type ExpenseInsightsDTO = {
  totals: { month: string; spend: number; txns: number };
  byCategory: { name: string; amount: number }[];
  byMethod: { name: string; amount: number }[];
  topMerchants: { title: string; amount: number; count: number }[];
  unusual: Txn[]; // large txns
};

export type AskAiDTO = {
  question: string;
  answer: string;
  bullets: string[];
};

export type ExpenseDetails = {
  title: string;
  category: string;
  paymentMethod: PaymentMethod;
  amount: number;
  date: string | null;
  description?: string;
  currency?: string;
  merchant?: string | null;
  notes?: string | null;
};

export type ExpenseAIResult = {
  expense: ExpenseDetails;
  confidence: number;
  warnings: string[];
  rawText?: string;
};
