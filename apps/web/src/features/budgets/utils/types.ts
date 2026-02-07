export type BudgetMode = "STRICT" | "FLEXIBLE" | "SAVINGS";

export type AlertChannel = "IN_APP" | "EMAIL";

export type AlertThreshold = 50 | 75 | 90 | 100;

export type Severity = "OK" | "WARN" | "DANGER";

export type CategoryKey =
  | "Food & Dining"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Rent"
  | "Groceries"
  | (string & {});

export type BudgetMonth = string; // "YYYY-MM"

export type Money = number;

export interface Budget {
  id: string;
  month: BudgetMonth;
  currency: "INR";
  totalLimit: Money;
  mode: BudgetMode;
  rolloverUnused: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  month: BudgetMonth;
  totalLimit: Money;
  totalSpent: Money;
  remaining: Money;
  percentUsed: number; // 0-100
  dailyAllowance: Money;
  daysRemaining: number;
}

export interface CategoryBudget {
  id: string;
  month: BudgetMonth;
  category: CategoryKey;
  limit: Money;
  spent: Money;
  remaining: Money;
  percentUsed: number;
  severity: Severity;
}

export interface BudgetHealthScore {
  score: number; // 0-100
  label: "Great" | "Good" | "At Risk" | "Critical";
  reasons: string[];
}

export interface BurnRateForecast {
  projectedRunoutDate?: string; // ISO
  riskCategory?: CategoryKey;
  riskPercent?: number;
  note: string;
}

export interface AiSuggestion {
  id: string;
  title: string;
  detail: string;
  impactINR: Money; // + saves, - costs
  action: "APPLY_REALLOCATE" | "TUNE_LIMITS" | "ENABLE_GUARDRAIL";
}

export interface AlertRule {
  id: string;
  month: BudgetMonth;
  scope: "TOTAL" | "CATEGORY";
  category?: CategoryKey;
  threshold: AlertThreshold;
  channel: AlertChannel;
  enabled: boolean;
}

export interface GuardrailRule {
  id: string;
  month: BudgetMonth;
  type:
    | "CONFIRM_ON_EXCEED"
    | "SOFT_LOCK_ON_EXCEED"
    | "WARN_BEFORE_SPEND"
    | "WEEKLY_CAP";
  enabled: boolean;
  value?: number; // e.g. weekly cap INR
  category?: CategoryKey;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: Money;
  currentAmount: Money;
  targetDate?: string; // ISO
  autoAllocateUnused: boolean;
}

export interface BudgetHistoryMonth {
  month: BudgetMonth;
  totalLimit: Money;
  totalSpent: Money;
  overspent: boolean;
  healthScore: number;
}

export interface BudgetUsagePoint {
  date: string; // "YYYY-MM-DD"
  spent: Money;
  budgetLine: Money;
}

export interface OverspendHeatCell {
  day: number; // 1..31
  value: number; // spend
  severity: Severity;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  changes: Array<
    | { kind: "TOTAL_LIMIT"; value: Money }
    | { kind: "CATEGORY_LIMIT"; category: CategoryKey; value: Money }
    | { kind: "MODE"; value: BudgetMode }
  >;
}

export interface BudgetDTO {
  budget: Budget;
  summary: BudgetSummary;
  health: BudgetHealthScore;
  forecast: BurnRateForecast;
  suggestions: AiSuggestion[];
  categories: CategoryBudget[];
  alertRules: AlertRule[];
  guardrails: GuardrailRule[];
  goals: Goal[];
  usageSeries: BudgetUsagePoint[];
  heatmap: OverspendHeatCell[];
  history: BudgetHistoryMonth[];
}
