# Root Structure

SpendSenseAI/
├── apps/
│ ├── web/ # React 19 + Vite + TS frontend
│ └── api/ # FastAPI API + Worker (same codebase, 2 entrypoints)
│
├── packages/
│ ├── contracts/ # Single source of truth for API + events
│ ├── api-client/ # Generated TS client from OpenAPI
│ ├── eslint-config/ # Shared lint rules across apps
│ ├── tsconfig/ # Shared TS configs (paths, strictness)
│ └── shared-types/ # Optional: TS-only shared types for FE
│
├── infra/
│ ├── terraform/
│ │ ├── modules/ # Reusable building blocks
│ │ └── envs/
│ │ ├── dev/
│ │ └── prod/
│ └── docker/
│ ├── Dockerfile.api # API image for ECS/Lambda container
│ ├── Dockerfile.worker # Worker image for ECS
│ └── docker-compose.local.yml
│
├── scripts/
│ ├── dev.sh # Runs web + api + worker locally
│ ├── lint.sh # Lint everything
│ ├── test.sh # Run unit tests for all apps
│ └── codegen.sh # Generate TS client from OpenAPI
│
├── docs/
│ ├── architecture/
│ │ ├── overview.md
│ │ ├── data-model.md
│ │ ├── ingestion-lifecycle.md
│ │ └── adr/ # Architecture Decision Records
│ ├── api/
│ │ └── openapi-notes.md
│ └── runbooks/
│ └── worker-troubleshooting.md
│
├── .github/
│ └── workflows/
│ ├── ci.yml
│ ├── deploy-dev.yml
│ └── deploy-prod.yml
│
├── .editorconfig
├── .prettierrc
├── Makefile
├── README.md
└── .env.example

## Layer 1: User Layer (Frontend)

apps/web/
├── public/
│ ├── favicon.ico
│ └── robots.txt
│
├── src/
│ ├── main.tsx # React bootstrap
│ ├── app.tsx # Root component (providers + router)
│ └── index.css # Tailwind/shadcn global styles
│
│ ├── app/
│ │ ├── config/
│ │ │ ├── env.ts # Typed env loader (VITE\_\*)
│ │ │ └── constants.ts
│ │ │
│ │ ├── store/
│ │ │ ├── store.ts # Redux store
│ │ │ └── hooks.ts # Typed hooks
│ │ │
│ │ ├── router/
│ │ │ ├── router.tsx
│ │ │ ├── routes.ts # Route constants
│ │ │ └── guards.tsx # RequireAuth / PublicOnly guards
│ │ │
│ │ ├── providers/
│ │ │ └── AppProviders.tsx
│ │ │
│ │ └── error/
│ │ └── ErrorBoundary.tsx
│ │
│ ├── layouts/
│ │ ├── AuthLayout.tsx
│ │ ├── AppShell.tsx
│ │ └── SettingsLayout.tsx
│ │
│ ├── features/
│ │ ├── auth/
│ │ │ ├── pages/
│ │ │ │ ├── LoginPage.tsx
│ │ │ │ ├── RegisterPage.tsx
│ │ │ │ └── ForgotPasswordPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── LoginForm.tsx
│ │ │ │ └── RegisterForm.tsx
│ │ │ ├── api/
│ │ │ │ └── authApi.ts
│ │ │ ├── state/
│ │ │ │ └── authSlice.ts
│ │ │ └── utils/
│ │ │ └── session.ts
│ │ │
│ │ ├── dashboard/
│ │ │ ├── pages/
│ │ │ │ └── DashboardPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── SummaryCards.tsx
│ │ │ │ ├── SpendTrendChart.tsx
│ │ │ │ ├── CategoryPieChart.tsx
│ │ │ │ └── RecentExpenses.tsx
│ │ │ └── api/
│ │ │ └── dashboardApi.ts
│ │ │
│ │ ├── expenses/
│ │ │ ├── pages/
│ │ │ │ └── ExpensesPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── ExpensesTable.tsx
│ │ │ │ ├── ExpenseFilters.tsx
│ │ │ │ ├── ExpenseToolbar.tsx
│ │ │ │ ├── ExpenseForm.tsx
│ │ │ │ └── ExpenseDetails.tsx
│ │ │ ├── api/
│ │ │ │ └── expensesApi.ts
│ │ │ └── types/
│ │ │ └── expense.types.ts
│ │ │
│ │ ├── ingestion/
│ │ │ ├── pages/
│ │ │ │ └── IngestionPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── ManualTab.tsx
│ │ │ │ ├── ReceiptUploadTab.tsx
│ │ │ │ ├── ScreenshotUploadTab.tsx
│ │ │ │ ├── AudioUploadTab.tsx
│ │ │ │ ├── DraftPreview.tsx
│ │ │ │ ├── ConfidenceBadge.tsx
│ │ │ │ └── UploadProgress.tsx
│ │ │ ├── api/
│ │ │ │ └── ingestionApi.ts
│ │ │ ├── state/
│ │ │ │ └── draftExpenseSlice.ts
│ │ │ └── types/
│ │ │ └── ingestion.types.ts
│ │ │
│ │ ├── categories/
│ │ │ ├── pages/
│ │ │ │ └── CategoriesPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── CategoryList.tsx
│ │ │ │ ├── CategoryForm.tsx
│ │ │ │ └── RuleBuilder.tsx
│ │ │ ├── api/
│ │ │ │ └── categoriesApi.ts
│ │ │ └── types/
│ │ │ └── category.types.ts
│ │ │
│ │ ├── budgets/
│ │ │ ├── pages/
│ │ │ │ └── BudgetsPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── BudgetTable.tsx
│ │ │ │ ├── BudgetForm.tsx
│ │ │ │ └── BudgetProgress.tsx
│ │ │ └── api/
│ │ │ └── budgetsApi.ts
│ │ │
│ │ ├── analytics/
│ │ │ ├── pages/
│ │ │ │ └── AnalyticsPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── MonthlyBreakdown.tsx
│ │ │ │ ├── CategoryTrend.tsx
│ │ │ │ └── MerchantTrend.tsx
│ │ │ └── api/
│ │ │ └── analyticsApi.ts
│ │ │
│ │ ├── insights/
│ │ │ ├── pages/
│ │ │ │ └── InsightsPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── InsightCard.tsx
│ │ │ │ └── InsightDetails.tsx
│ │ │ └── api/
│ │ │ └── insightsApi.ts
│ │ │
│ │ ├── anomalies/
│ │ │ ├── pages/
│ │ │ │ └── AnomaliesPage.tsx
│ │ │ ├── components/
│ │ │ │ ├── AnomalyList.tsx
│ │ │ │ └── AnomalyDetails.tsx
│ │ │ └── api/
│ │ │ └── anomaliesApi.ts
│ │ │
│ │ └── settings/
│ │ ├── pages/
│ │ │ ├── ProfilePage.tsx
│ │ │ ├── PreferencesPage.tsx
│ │ │ └── IntegrationsPage.tsx
│ │ └── components/
│ │ └── PreferencesForm.tsx
│ │
│ ├── components/
│ │ ├── ui/ # shadcn components
│ │ ├── PageHeader.tsx
│ │ ├── EmptyState.tsx
│ │ ├── LoadingState.tsx
│ │ ├── ErrorState.tsx
│ │ ├── DataTable.tsx
│ │ ├── DateRangePicker.tsx
│ │ └── Money.tsx
│ │
│ ├── modals/
│ │ ├── ModalHost.tsx
│ │ ├── ConfirmDialog.tsx
│ │ ├── ExpenseDetailDrawer.tsx
│ │ ├── SessionExpiredModal.tsx
│ │ └── UploadProgressModal.tsx
│ │
│ ├── lib/
│ │ ├── api/
│ │ │ ├── baseApi.ts
│ │ │ └── baseQuery.ts
│ │ ├── validators/
│ │ │ └── zod.ts
│ │ └── utils/
│ │ ├── date.ts
│ │ ├── money.ts
│ │ └── strings.ts
│ │
│ └── types/
│ ├── common.ts
│ └── api.ts
│
├── tests/
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json

## Layer 2: API Layer (FastAPI)

apps/api/
├── app/
│ ├── main.py # FastAPI app entry
│ ├── asgi.py # ASGI entry (optional for gunicorn/uvicorn)
│ └── **init**.py
│
│ ├── core/
│ │ ├── config.py # env settings (AWS region, table names)
│ │ ├── logging.py # structured logs (critical for production)
│ │ ├── security.py # JWT verify (Cognito) + auth helpers
│ │ ├── exceptions.py # consistent API errors
│ │ ├── middleware.py # CORS, request-id, timing
│ │ ├── telemetry.py # tracing hooks (optional but recommended)
│ │ └── rate_limit.py # simple safety (abuse control)
│ │
│ ├── api/
│ │ ├── deps.py # dependencies (auth user, db clients)
│ │ └── v1/
│ │ ├── router.py # includes module routers
│ │ └── routes/
│ │ ├── health.py
│ │ ├── auth.py
│ │ ├── expenses.py
│ │ ├── categories.py
│ │ ├── budgets.py
│ │ ├── analytics.py
│ │ ├── ingestion.py
│ │ ├── insights.py
│ │ ├── anomalies.py
│ │ └── webhooks.py
│ │
│ ├── schemas/ # Pydantic models (request/response validation)
│ │ ├── common.py
│ │ ├── auth.py
│ │ ├── expense.py
│ │ ├── category.py
│ │ ├── budget.py
│ │ ├── analytics.py
│ │ ├── ingestion.py
│ │ ├── insight.py
│ │ └── anomaly.py
│ │
│ ├── domain/ # pure business entities
│ │ ├── entities/
│ │ │ ├── expense_entity.py
│ │ │ └── ingestion_job_entity.py
│ │ └── value_objects/
│ │ ├── money.py
│ │ ├── date_range.py
│ │ └── confidence.py
│ │
│ ├── services/ # business logic (rules, orchestration)
│ │ ├── expenses_service.py
│ │ ├── categories_service.py
│ │ ├── budgets_service.py
│ │ ├── analytics_service.py
│ │ ├── ingestion_service.py
│ │ ├── insights_service.py
│ │ └── anomalies_service.py
│ │
│ ├── repos/ # DynamoDB access layer
│ │ ├── expenses_repo.py
│ │ ├── categories_repo.py
│ │ ├── budgets_repo.py
│ │ ├── ingestion_repo.py
│ │ ├── insights_repo.py
│ │ ├── anomalies_repo.py
│ │ └── idempotency_repo.py
│ │
│ ├── clients/ # AWS low-level wrappers
│ │ ├── dynamodb_client.py
│ │ ├── s3_client.py
│ │ ├── sqs_client.py
│ │ ├── textract_client.py
│ │ └── transcribe_client.py
│ │
│ ├── workers/ # background processing (SQS consumer)
│ │ ├── run_worker.py # worker entrypoint (ECS service)
│ │ ├── sqs_consumer.py # poll SQS, dispatch handlers
│ │ ├── scheduler.py # scheduled tasks
│ │ └── handlers/
│ │ ├── ingestion_handler.py
│ │ └── monthly_rollup_handler.py
│ │
│ ├── pipelines/ # "AI layer" (rules-first, low-cost)
│ │ ├── common/
│ │ │ ├── interfaces.py
│ │ │ └── confidence.py
│ │ ├── receipt_ocr/
│ │ │ ├── pipeline.py
│ │ │ ├── parsers.py
│ │ │ └── normalizers.py
│ │ ├── screenshot_parser/
│ │ │ ├── pipeline.py
│ │ │ └── patterns.py
│ │ ├── audio_parser/
│ │ │ ├── pipeline.py
│ │ │ └── intent_parser.py
│ │ ├── categorizer/
│ │ │ ├── pipeline.py
│ │ │ └── rules.py
│ │ ├── anomaly_engine/
│ │ │ ├── pipeline.py
│ │ │ └── rules.py
│ │ └── insights_engine/
│ │ ├── pipeline.py
│ │ └── templates.py
│ │
│ └── utils/
│ ├── time.py
│ ├── money.py
│ ├── strings.py
│ └── hashing.py
│
├── tests/
│ ├── test_health.py
│ ├── test_expenses.py
│ └── test_ingestion.py
│
├── scripts/
│ ├── dev_run_api.sh
│ └── dev_run_worker.sh
│
├── .env.example
├── pyproject.toml
├── README.md
└── Dockerfile

## Layer 3: Contracts Layer (Shared)

packages/contracts/
├── api/
│ ├── openapi.yaml # stable API contract (source of truth)
│ └── versions/
│ └── v1/
│
├── events/
│ ├── ingestion-job-created.json
│ ├── ingestion-job-completed.json
│ └── ingestion-job-failed.json
│
├── shared/
│ ├── money.json
│ ├── date.json
│ ├── confidence.json
│ ├── pagination.json
│ └── error.json
│
├── examples/
│ ├── ingestion_receipt.json
│ ├── ingestion_screenshot.json
│ └── ingestion_audio.json
│
└── README.md

## Layer 4: Client Layer (Generated)

packages/api-client/
├── src/
│ └── index.ts # exported generated client
├── openapi/ # copy or link to contracts openapi
└── README.md
