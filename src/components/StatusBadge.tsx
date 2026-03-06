"use client";

import { cn } from "@/lib/utils";
import { AssetStatus } from "@/lib/types";

const styles: Record<AssetStatus, string> = {
  "In Stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Low Stock": "bg-amber-100 text-amber-800 border-amber-200",
  "Out of Stock": "bg-red-100 text-red-800 border-red-200",
  "Needs Attention": "bg-orange-100 text-orange-800 border-orange-200",
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

const urgencyStyles: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-800",
  High: "bg-amber-100 text-amber-800",
  Critical: "bg-red-100 text-red-800",
};

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        urgencyStyles[urgency] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {urgency}
    </span>
  );
}

const requestStatusStyles: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Ordered: "bg-indigo-100 text-indigo-800",
  Fulfilled: "bg-emerald-100 text-emerald-800",
  Denied: "bg-red-100 text-red-800",
};

export function RequestStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        requestStatusStyles[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}
