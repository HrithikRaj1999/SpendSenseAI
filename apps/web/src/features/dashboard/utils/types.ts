export type Money = number;

export type CategorySpend = {
  id: string;
  name: string;
  amount: Money;
};

export type TrendPoint = {
  date: string; // YYYY-MM-DD
  amount: Money;
};

export type RecentExpense = {
  id: string;
  title: string;
  category: string;
  amount: Money;
  date: string; // ISO
  paymentMethod: "UPI" | "Card" | "Cash" | "NetBanking";
};

export type DashboardDTO = {
  summary: {
    monthSpend: Money;
    monthBudget: Money;
    savingsEstimate: Money;
    biggestCategory: string;
  };
  trend: TrendPoint[];
  categories: CategorySpend[];
  recent: RecentExpense[];
};
