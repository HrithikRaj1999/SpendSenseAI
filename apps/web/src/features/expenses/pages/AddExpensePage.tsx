import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { ArrowLeft, PlusCircle, Sparkles, Wallet } from "lucide-react";
import { useCreateExpenseMutation } from "../api/expensesApi";
import { AiImportModal } from "../components/AiImportModal";
import { ExpenseDetails } from "../types";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Rent",
  "Groceries",
];

const METHODS = ["UPI", "Card", "NetBanking", "Cash"] as const;

export default function AddExpensePage() {
  const nav = useNavigate();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] =
    React.useState<(typeof METHODS)[number]>("UPI");
  const [amount, setAmount] = React.useState<number>(0);
  const [date, setDate] = React.useState<string>(new Date().toISOString());

  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const handleImportConfirm = (data: ExpenseDetails) => {
    setTitle(data.title);
    setCategory(data.category);
    setPaymentMethod(data.paymentMethod);
    setAmount(data.amount);
    if (data.date) setDate(data.date);
    // Description ignored for MVP as per user instruction
  };

  async function onSave() {
    if (!title.trim() || amount <= 0) return;

    await createExpense({
      title,
      category,
      paymentMethod,
      amount,
      date,
      // description, // Backend might not support it yet unless checked
    }).unwrap();

    nav(ROUTES.EXPENSES);
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => nav(ROUTES.EXPENSES)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Add Expense
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a transaction manually — later you’ll also support receipt,
              voice, and screenshot.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-dashed" onClick={() => setImportModalOpen(true)}>
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Import from Image
          </Button>
          <Badge variant="secondary" className="rounded-xl">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Smart defaults enabled
          </Badge>
        </div>
      </div>

      <AiImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirm={handleImportConfirm}
      />

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Expense Details
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Title / Merchant
            </p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Swiggy, Rent, Metro, Amazon..."
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Category
            </p>
            <select
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Payment Method
            </p>
            <select
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Amount
            </p>
            <Input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value || 0))}
              placeholder="0"
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Date (ISO)
            </p>
            <Input value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => nav(ROUTES.EXPENSES)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-2xl"
              onClick={onSave}
              disabled={isLoading || !title.trim() || amount <= 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Save Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
