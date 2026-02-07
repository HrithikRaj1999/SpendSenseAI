import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useAskAiMutation } from "../api/askAiApi";

export default function AskAiPage() {
  const nav = useNavigate();
  const [askAi, { data, isLoading }] = useAskAiMutation();
  const [q, setQ] = React.useState("");

  async function onAsk() {
    if (!q.trim()) return;
    await askAi({ question: q }).unwrap();
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
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
              Ask AI
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask questions about your spending — get quick, actionable answers.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="rounded-xl">
          <Sparkles className="mr-2 h-4 w-4" />
          Expense Copilot
        </Badge>
      </div>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Question</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Why is my food spend high this month?"
          />
          <Button className="rounded-2xl" onClick={onAsk} disabled={isLoading}>
            <Send className="mr-2 h-4 w-4" />
            Ask
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">AI Answer</CardTitle>
        </CardHeader>

        <CardContent>
          {!data ? (
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              Try asking: “How can I save ₹5000/month?” or “What should I cut
              first?”
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground">{data.answer}</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {data.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
