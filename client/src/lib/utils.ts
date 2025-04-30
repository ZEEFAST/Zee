import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string | number, formatStr = "MMM dd, yyyy"): string {
  return format(new Date(date), formatStr);
}

export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), "MMM dd, yyyy h:mm a");
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function generateAvatarUrl(name: string, size = 128): string {
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=3b82f6&color=fff&size=${size}`;
}

export function getRandomColor(seed: string): string {
  // Simple hash function to get a deterministic but random-looking number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  
  return color;
}

export function getRankBadgeColor(rank: string): string {
  switch (rank.toLowerCase()) {
    case "bronze":
      return "bg-amber-700 text-amber-100";
    case "silver":
      return "bg-gray-400 text-gray-900";
    case "gold":
      return "bg-yellow-500 text-yellow-900";
    case "platinum":
      return "bg-slate-300 text-slate-900";
    case "diamond":
      return "bg-blue-400 text-blue-900";
    default:
      return "bg-gray-500 text-white";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "active":
    case "approved":
      return "text-green-500 dark:text-green-400";
    case "pending":
    case "processing":
      return "text-yellow-500 dark:text-yellow-400";
    case "failed":
    case "rejected":
    case "inactive":
      return "text-red-500 dark:text-red-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "active":
    case "approved":
      return "bg-green-100 dark:bg-green-900";
    case "pending":
    case "processing":
      return "bg-yellow-100 dark:bg-yellow-900";
    case "failed":
    case "rejected":
    case "inactive":
      return "bg-red-100 dark:bg-red-900";
    default:
      return "bg-gray-100 dark:bg-gray-800";
  }
}

export function calculatePortfolioAllocation(
  wallets: Array<{ balance: number; type: string }>
): { type: string; percentage: number }[] {
  const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  if (total === 0) return [];
  
  // Group wallets by type and sum balances
  const typeGroups: Record<string, number> = {};
  for (const wallet of wallets) {
    const type = wallet.type.includes("crypto") ? "Cryptocurrency" : 
                wallet.type === "main" ? "Bank Deposits" : 
                wallet.type === "savings" ? "Savings" : wallet.type;
    
    typeGroups[type] = (typeGroups[type] || 0) + wallet.balance;
  }
  
  // Calculate percentages
  const result = Object.entries(typeGroups).map(([type, balance]) => ({
    type,
    percentage: Math.round((balance / total) * 100),
  }));
  
  // Sort by percentage (descending)
  return result.sort((a, b) => b.percentage - a.percentage);
}

export const DEFAULT_AVATAR_URL = "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff";
