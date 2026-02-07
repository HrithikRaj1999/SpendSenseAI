import type {
  Budget,
  BudgetDTO,
  BudgetHealthScore,
  BudgetMonth,
  BudgetSummary,
  BurnRateForecast,
  AiSuggestion,
  CategoryBudget,
  CategoryKey,
  AlertRule,
  GuardrailRule,
  Goal,
  BudgetUsagePoint,
  OverspendHeatCell,
  BudgetHistoryMonth,
  WhatIfScenario,
  BudgetMode,
  AlertThreshold,
  AlertChannel,
} from "../utils/types";
import { pct, severityFromPct } from "../utils/budgetMath";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();

const CATEGORIES: CategoryKey[] = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Rent",
  "Groceries",
];

const uid = (p = "id") =>
  `${p}_${Math.random().toString(16).slice(2)}_${Date.now()}`;

function monthNow(): BudgetMonth {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// -------------------- MOCK DB --------------------
type MonthStore = {
  budget: Budget;
  categoryLimits: Record<string, number>;
  alertRules: AlertRule[];
  guardrails: GuardrailRule[];
  goals: Goal[];
};

const MockBudgetsDB: {
  activeMonth: BudgetMonth;
  months: Record<BudgetMonth, MonthStore>;
} = {
  activeMonth: "2026-02",
  months: {},
};

// seed once
(function seed() {
  const month: BudgetMonth = MockBudgetsDB.activeMonth;

  const budget: Budget = {
    id: uid("b"),
    month,
    currency: "INR",
    totalLimit: 60000,
    mode: "FLEXIBLE",
    rolloverUnused: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const baseLimits: Record<string, number> = {
    "Food & Dining": 12000,
    Transport: 5000,
    Shopping: 8000,
    Bills: 9000,
    Entertainment: 5000,
    Health: 4000,
    Rent: 15000,
    Groceries: 7000,
  };

  const alertRules: AlertRule[] = [
    {
      id: uid("ar"),
      month,
      scope: "TOTAL",
      threshold: 75 as AlertThreshold,
      channel: "IN_APP" as AlertChannel,
      enabled: true,
    },
    {
      id: uid("ar"),
      month,
      scope: "CATEGORY",
      category: "Food & Dining",
      threshold: 90 as AlertThreshold,
      channel: "IN_APP" as AlertChannel,
      enabled: true,
    },
  ];

  const guardrails: GuardrailRule[] = [
    {
      id: uid("gr"),
      month,
      type: "CONFIRM_ON_EXCEED",
      enabled: true,
    },
    {
      id: uid("gr"),
      month,
      type: "WEEKLY_CAP",
      enabled: false,
      value: 3500,
      category: "Food & Dining",
    },
  ];

  const goals: Goal[] = [
    {
      id: uid("g"),
      title: "Emergency Fund",
      targetAmount: 20000,
      currentAmount: 6000,
      targetDate: undefined,
      autoAllocateUnused: true,
    },
  ];

  MockBudgetsDB.months[month] = {
    budget,
    categoryLimits: baseLimits,
    alertRules,
    guardrails,
    goals,
  };
})();

// -------------------- helpers: spent simulation --------------------
// For end-to-end UI testing, we simulate "spent" based on limit and random-ish patterns.
function deriveCategorySpent(limit: number, category: CategoryKey) {
  // deterministic-ish per category
  const bias =
    category === "Rent"
      ? 0.95
      : category === "Bills"
        ? 0.8
        : category === "Food & Dining"
          ? 0.9
          : category === "Shopping"
            ? 0.7
            : 0.6;

  const noise = 0.35; // range variation
  const r = (Math.sin(limit + category.length) + 1) / 2; // 0..1
  const factor = bias + (r - 0.5) * noise; // around bias
  return Math.max(0, Math.round(limit * factor));
}

function daysInMonth(month: BudgetMonth) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function buildUsageSeries(
  month: BudgetMonth,
  totalLimit: number,
  totalSpent: number,
): BudgetUsagePoint[] {
  const d = daysInMonth(month);
  const [y, m] = month.split("-");
  const points: BudgetUsagePoint[] = [];

  // spread spend across month
  let acc = 0;
  for (let day = 1; day <= d; day++) {
    const frac = day / d;
    const target = Math.round(totalSpent * frac);
    // small wobble
    const wobble = Math.round(Math.sin(day) * 0.03 * totalSpent);
    acc = Math.max(acc, target + wobble);

    const dd = String(day).padStart(2, "0");
    points.push({
      date: `${y}-${m}-${dd}`,
      spent: Math.max(0, acc),
      budgetLine: Math.round(totalLimit * frac),
    });
  }
  return points;
}

function buildHeatmap(
  month: BudgetMonth,
  totalSpent: number,
): OverspendHeatCell[] {
  const d = daysInMonth(month);
  const out: OverspendHeatCell[] = [];
  for (let day = 1; day <= d; day++) {
    const base = totalSpent / d;
    const wobble = base * (0.4 * Math.sin(day));
    const value = Math.max(0, Math.round(base + wobble));
    const p = pct(value, base);
    out.push({
      day,
      value,
      severity: severityFromPct(p),
    });
  }
  return out;
}

function calcSummary(
  month: BudgetMonth,
  totalLimit: number,
  totalSpent: number,
): BudgetSummary {
  const remaining = totalLimit - totalSpent;
  const percentUsed = pct(totalSpent, totalLimit);

  // for demo: compute "days remaining" relative to mid-month
  const d = daysInMonth(month);
  const assumedToday = Math.min(d, 18); // stable demo
  const daysRemaining = Math.max(0, d - assumedToday);

  const dailyAllowance =
    daysRemaining > 0
      ? Math.max(0, Math.round(remaining / daysRemaining))
      : Math.max(0, remaining);

  return {
    month,
    totalLimit,
    totalSpent,
    remaining,
    percentUsed,
    dailyAllowance,
    daysRemaining,
  };
}

function calcHealth(summary: BudgetSummary): BudgetHealthScore {
  const score = Math.max(0, 100 - summary.percentUsed);
  const label =
    score >= 70
      ? "Great"
      : score >= 50
        ? "Good"
        : score >= 30
          ? "At Risk"
          : "Critical";

  const reasons: string[] = [];
  if (summary.percentUsed >= 90)
    reasons.push("You have used 90%+ of your monthly budget.");
  if (summary.dailyAllowance < 300)
    reasons.push("Daily allowance is low; risk of overspend.");
  if (!reasons.length) reasons.push("Spending trend is within healthy range.");

  return { score, label, reasons };
}

function calcForecast(
  summary: BudgetSummary,
  categories: CategoryBudget[],
): BurnRateForecast {
  const risk = categories
    .slice()
    .sort((a, b) => b.percentUsed - a.percentUsed)[0];
  const riskPercent = risk?.percentUsed ?? 0;

  let note = "No major risk detected.";
  if (summary.percentUsed >= 85)
    note = "At current burn rate, you may exceed your budget.";
  if (riskPercent >= 100) note = `Category overspent: ${risk.category}`;

  return {
    projectedRunoutDate:
      summary.percentUsed >= 85
        ? new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString()
        : undefined,
    riskCategory: risk?.category,
    riskPercent,
    note,
  };
}

function calcSuggestions(
  summary: BudgetSummary,
  categories: CategoryBudget[],
  mode: BudgetMode,
): AiSuggestion[] {
  const top = categories.slice().sort((a, b) => b.spent - a.spent)[0];
  const suggestions: AiSuggestion[] = [];

  if (top) {
    suggestions.push({
      id: uid("s"),
      title: `Tighten ${top.category} limit`,
      detail: `Your spend is concentrated in ${top.category}. Consider lowering the limit by 10% or setting weekly caps.`,
      impactINR: Math.round(top.limit * 0.1),
      action: "TUNE_LIMITS",
    });
  }

  if (mode !== "SAVINGS") {
    suggestions.push({
      id: uid("s"),
      title: "Switch to Savings mode",
      detail:
        "Savings mode prioritizes protective limits and suggests reallocations automatically.",
      impactINR: 1500,
      action: "ENABLE_GUARDRAIL",
    });
  }

  if (summary.dailyAllowance < 400) {
    suggestions.push({
      id: uid("s"),
      title: "Reallocate from low-usage categories",
      detail:
        "Move ₹500–₹1000 from under-used categories into essentials (Bills/Groceries) to reduce overspend stress.",
      impactINR: 800,
      action: "APPLY_REALLOCATE",
    });
  }

  return suggestions.slice(0, 4);
}

function buildHistory(
  month: BudgetMonth,
  totalLimit: number,
  totalSpent: number,
  healthScore: number,
): BudgetHistoryMonth[] {
  // last 6 months fake history
  const out: BudgetHistoryMonth[] = [];
  const [yy, mm] = month.split("-").map(Number);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(yy, mm - 1 - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const mk = `${y}-${m}` as BudgetMonth;

    const lim = Math.round(totalLimit * (0.95 + i * 0.01));
    const sp = Math.round(totalSpent * (0.9 + i * 0.02));
    const hs = Math.max(0, Math.min(100, healthScore + (i - 2) * 4));

    out.push({
      month: mk,
      totalLimit: lim,
      totalSpent: sp,
      overspent: sp > lim,
      healthScore: hs,
    });
  }
  return out;
}

// Full DTO builder for a month
function buildDTO(month: BudgetMonth): BudgetDTO {
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const totalLimit = store.budget.totalLimit;

  const categories: CategoryBudget[] = CATEGORIES.map((c) => {
    const limit =
      store.categoryLimits[c] ?? Math.round(totalLimit / CATEGORIES.length);
    const spent = deriveCategorySpent(limit, c);
    const remaining = limit - spent;
    const percentUsed = pct(spent, limit);

    return {
      id: uid("cb"),
      month,
      category: c,
      limit,
      spent,
      remaining,
      percentUsed,
      severity: severityFromPct(percentUsed),
    };
  });

  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const summary = calcSummary(month, totalLimit, totalSpent);
  const health = calcHealth(summary);
  const forecast = calcForecast(summary, categories);
  const suggestions = calcSuggestions(summary, categories, store.budget.mode);

  const usageSeries = buildUsageSeries(month, totalLimit, totalSpent);
  const heatmap = buildHeatmap(month, totalSpent);
  const history = buildHistory(month, totalLimit, totalSpent, health.score);

  return {
    budget: store.budget,
    summary,
    health,
    forecast,
    suggestions,
    categories,
    alertRules: store.alertRules,
    guardrails: store.guardrails,
    goals: store.goals,
    usageSeries,
    heatmap,
    history,
  };
}

function createMonthIfMissing(month: BudgetMonth): MonthStore {
  const createdAt = nowIso();
  const store: MonthStore = {
    budget: {
      id: uid("b"),
      month,
      currency: "INR",
      totalLimit: 60000,
      mode: "FLEXIBLE",
      rolloverUnused: false,
      createdAt,
      updatedAt: createdAt,
    },
    categoryLimits: Object.fromEntries(
      CATEGORIES.map((c) => [c, 60000 / CATEGORIES.length]),
    ),
    alertRules: [],
    guardrails: [],
    goals: [],
  };
  MockBudgetsDB.months[month] = store;
  return store;
}

// -------------------- public mock "handlers" --------------------
export async function mockGetActiveBudget(): Promise<BudgetDTO> {
  await sleep(200);
  return buildDTO(MockBudgetsDB.activeMonth);
}

export async function mockGetBudgetByMonth(
  month: BudgetMonth,
): Promise<BudgetDTO> {
  await sleep(200);
  MockBudgetsDB.activeMonth = month;
  if (!MockBudgetsDB.months[month]) createMonthIfMissing(month);
  return buildDTO(month);
}

export async function mockUpsertCategoryBudget(input: {
  month: BudgetMonth;
  category: string;
  limit: number;
}): Promise<CategoryBudget> {
  await sleep(200);
  const store =
    MockBudgetsDB.months[input.month] ?? createMonthIfMissing(input.month);
  store.categoryLimits[input.category] = Math.max(0, Math.round(input.limit));
  store.budget.updatedAt = nowIso();

  // return the updated row shape
  const dto = buildDTO(input.month);
  const row = dto.categories.find((c) => c.category === input.category);
  if (!row) throw new Error("Category not found");
  return row;
}

export async function mockToggleAlertRule(input: {
  id: string;
  enabled: boolean;
}): Promise<AlertRule> {
  await sleep(150);
  const month = MockBudgetsDB.activeMonth;
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const idx = store.alertRules.findIndex((r) => r.id === input.id);
  if (idx === -1) throw new Error("Alert rule not found");

  store.alertRules[idx] = { ...store.alertRules[idx], enabled: input.enabled };
  return store.alertRules[idx];
}

export async function mockCreateAlertRule(
  body: Partial<AlertRule>,
): Promise<AlertRule> {
  await sleep(200);
  const month = (body.month ?? MockBudgetsDB.activeMonth) as BudgetMonth;
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const rule: AlertRule = {
    id: uid("ar"),
    month,
    scope: body.scope ?? "TOTAL",
    category: body.category,
    threshold: (body.threshold ?? 75) as AlertThreshold,
    channel: (body.channel ?? "IN_APP") as AlertChannel,
    enabled: body.enabled ?? true,
  };

  store.alertRules = [rule, ...store.alertRules];
  return rule;
}

export async function mockToggleGuardrail(input: {
  id: string;
  enabled: boolean;
}): Promise<GuardrailRule> {
  await sleep(150);
  const month = MockBudgetsDB.activeMonth;
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const idx = store.guardrails.findIndex((r) => r.id === input.id);
  if (idx === -1) throw new Error("Guardrail not found");

  store.guardrails[idx] = { ...store.guardrails[idx], enabled: input.enabled };
  return store.guardrails[idx];
}

export async function mockCreateGuardrail(
  body: Partial<GuardrailRule>,
): Promise<GuardrailRule> {
  await sleep(200);
  const month = (body.month ?? MockBudgetsDB.activeMonth) as BudgetMonth;
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const rule: GuardrailRule = {
    id: uid("gr"),
    month,
    type: body.type ?? "CONFIRM_ON_EXCEED",
    enabled: body.enabled ?? true,
    value: body.value,
    category: body.category,
  };

  store.guardrails = [rule, ...store.guardrails];
  return rule;
}

export async function mockCreateGoal(body: Partial<Goal>): Promise<Goal> {
  await sleep(200);
  const month = MockBudgetsDB.activeMonth;
  const store = MockBudgetsDB.months[month] ?? createMonthIfMissing(month);

  const goal: Goal = {
    id: uid("g"),
    title: body.title ?? "New Goal",
    targetAmount: Math.max(0, Math.round(body.targetAmount ?? 10000)),
    currentAmount: Math.max(0, Math.round(body.currentAmount ?? 0)),
    targetDate: body.targetDate,
    autoAllocateUnused: body.autoAllocateUnused ?? false,
  };

  store.goals = [goal, ...store.goals];
  return goal;
}

export async function mockSimulateWhatIf(input: {
  month: BudgetMonth;
  scenario: WhatIfScenario;
}): Promise<BudgetDTO> {
  await sleep(250);

  const base = buildDTO(input.month);
  const copy: BudgetDTO = JSON.parse(JSON.stringify(base)) as BudgetDTO;

  for (const change of input.scenario.changes) {
    if (change.kind === "TOTAL_LIMIT") {
      copy.budget.totalLimit = Math.max(0, Math.round(change.value));
    }
    if (change.kind === "MODE") {
      copy.budget.mode = change.value;
    }
    if (change.kind === "CATEGORY_LIMIT") {
      const row = copy.categories.find((c) => c.category === change.category);
      if (row) {
        row.limit = Math.max(0, Math.round(change.value));
        row.percentUsed = pct(row.spent, row.limit);
        row.remaining = row.limit - row.spent;
        row.severity = severityFromPct(row.percentUsed);
      }
    }
  }

  // recompute summary/health/forecast/suggestions from adjusted limits
  const totalSpent = copy.categories.reduce((s, c) => s + c.spent, 0);
  copy.summary = calcSummary(
    copy.budget.month,
    copy.budget.totalLimit,
    totalSpent,
  );
  copy.health = calcHealth(copy.summary);
  copy.forecast = calcForecast(copy.summary, copy.categories);
  copy.suggestions = calcSuggestions(
    copy.summary,
    copy.categories,
    copy.budget.mode,
  );
  copy.usageSeries = buildUsageSeries(
    copy.budget.month,
    copy.budget.totalLimit,
    totalSpent,
  );
  copy.heatmap = buildHeatmap(copy.budget.month, totalSpent);
  copy.history = buildHistory(
    copy.budget.month,
    copy.budget.totalLimit,
    totalSpent,
    copy.health.score,
  );

  return copy;
}
