import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted string like "Rp 1.000" or "Rp 100.000"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) {
    return "Rp 0";
  }
  
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  
  if (Number.isNaN(numAmount)) {
    return "Rp 0";
  }
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}
