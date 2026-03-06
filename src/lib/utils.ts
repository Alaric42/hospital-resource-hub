import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getAssetStatus(
  quantity: number,
  threshold: number
): "In Stock" | "Low Stock" | "Out of Stock" | "Needs Attention" {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= threshold) return "Low Stock";
  if (quantity <= threshold * 1.2) return "Needs Attention";
  return "In Stock";
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}
