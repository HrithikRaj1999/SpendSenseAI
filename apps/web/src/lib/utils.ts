import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
