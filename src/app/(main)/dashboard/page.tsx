"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  ClipboardList,
  TrendingDown,
  Building2,
  ArrowRight,
  Upload,
} from "lucide-react";
import { StatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { EXPECTED_DEPARTMENTS } from "@/lib/mockData";

const PIE_COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#f97316"];

export default function DashboardPage() {
  const { assets, requests } = useApp();

  const isEmpty = assets.length === 0;

  const totalAssets = assets.length;
  const totalInventory = assets.reduce((s, a) => s + a.quantityAvailable, 0);
  const lowStock = assets.filter((a) => a.status === "Low Stock").length;
  const outOfStock = assets.filter((a) => a.status === "Out of Stock").length;
  const pendingRequests = requests.filter(
    (r) => r.status === "New" || r.status === "Under Review"
  ).length;
  const recentShortages = requests
    .filter((r) => r.type === "shortage" || r.urgency === "Critical")
    .slice(0, 5);

  const byCategory = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + a.quantityAvailable;
    return acc;
  }, {});
  const categoryChart = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const byDepartment = EXPECTED_DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = assets.filter((a) => a.department === dept).length;
    return acc;
  }, {});
  const departmentChart = Object.entries(byDepartment)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }));

  const statusCounts = {
    "In Stock": assets.filter((a) => a.status === "In Stock").length,
    "Low Stock": assets.filter((a) => a.status === "Low Stock").length,
    "Out of Stock": assets.filter((a) => a.status === "Out of Stock").length,
    "Needs Attention": assets.filter((a) => a.status === "Needs Attention").length,
  };
  const statusPie = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-hospital-navy">Dashboard</h1>
          <p className="text-slate-600">Overview of hospital resources and alerts</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">No hospital data uploaded yet</h2>
          <p className="mx-auto max-w-md text-slate-600">
            Upload your Excel workbook to begin. Your ICU, General Medicine, and Emergency data will appear here after import.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
          >
            <Upload className="h-4 w-4" />
            Upload Excel workbook
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Quick actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
            >
              Upload Excel
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Building2 className="h-4 w-4" />
              Vendor directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Dashboard</h1>
        <p className="text-slate-600">Overview of hospital resources and alerts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hospital-teal/10 text-hospital-teal">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total assets</p>
              <p className="text-2xl font-bold text-slate-900">{totalAssets}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Low stock items</p>
              <p className="text-2xl font-bold text-slate-900">{lowStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Out of stock</p>
              <p className="text-2xl font-bold text-slate-900">{outOfStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending requests</p>
              <p className="text-2xl font-bold text-slate-900">{pendingRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {departmentChart.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Department summary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {EXPECTED_DEPARTMENTS.map((dept) => {
              const count = assets.filter((a) => a.department === dept).length;
              const low = assets.filter((a) => a.department === dept && a.status === "Low Stock").length;
              const out = assets.filter((a) => a.department === dept && a.status === "Out of Stock").length;
              return (
                <div
                  key={dept}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                >
                  <p className="font-medium text-slate-800">{dept}</p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">assets · {low} low stock · {out} out of stock</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {categoryChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Inventory by category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {statusPie.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Asset status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {departmentChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Assets by department</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChart}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0369a1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent shortages & alerts</h2>
            <Link
              href="/requests"
              className="text-sm font-medium text-hospital-teal hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {recentShortages.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                No recent shortages
              </li>
            ) : (
              recentShortages.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-800">{r.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {r.department} · {formatDate(r.submittedAt)}
                    </p>
                  </div>
                  <UrgencyBadge urgency={r.urgency} />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Quick actions</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
          >
            Upload Excel
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View inventory
          </Link>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="h-4 w-4" />
            Vendor directory
          </Link>
        </div>
      </div>
    </div>
  );
}
