import { ROUTES } from "@/app/router/routes";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Sparkles,
  Settings,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, Icon: LayoutDashboard },
  { label: "Expenses", to: ROUTES.EXPENSES, Icon: Receipt },
  { label: "Budgets", to: ROUTES.BUDGETS, Icon: Wallet },
  { label: "AI Guru", to: ROUTES.AI, Icon: Sparkles },
  { label: "Settings", to: ROUTES.SETTINGS, Icon: Settings },
] as const;
