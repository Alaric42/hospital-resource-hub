"use client";

import { useApp } from "@/context/AppContext";
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
  CartesianGrid,
} from "recharts";
import { EXPECTED_DEPARTMENTS } from "@/lib/mockData";
import Link from "next/link";
import { BarChart3, Upload } from "lucide-react";

const PIE_COLORS = ["#0d9488", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"];

export default function AnalyticsPage() {
  const { assets, requests, vendors } = useApp();

  const hasData = assets.length > 0;

  const mostRequested = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.itemName] = (acc[r.itemName] ?? 0) + 1;
    return acc;
  }, {});
  const mostRequestedChart = Object.entries(mostRequested)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const byDepartment = EXPECTED_DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = requests.filter((r) => r.department === dept).length;
    return acc;
  }, {});
  const departmentChart = Object.entries(byDepartment)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }));

  const statusCounts = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusPie = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const requestStatusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const requestPie = Object.entries(requestStatusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const categoryDistribution = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + a.quantityAvailable;
    return acc;
  }, {});
  const categoryChart = Object.entries(categoryDistribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const assetByDept = EXPECTED_DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = assets.filter((a) => a.department === dept).length;
    return acc;
  }, {});
  const assetByDeptChart = Object.entries(assetByDept)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const vendorByCategory = vendors.flatMap((v) =>
    v.categoriesSupported.map((c) => ({ category: c, count: 1 }))
  ).reduce<Record<string, number>>((acc, { category }) => {
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
  const vendorMatchChart = Object.entries(vendorByCategory)
    .filter(([, c]) => c > 0)
    .map(([name, count]) => ({ name, count }));

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-hospital-navy">Analytics</h1>
          <p className="text-slate-600">Insights for decision-making</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">No analytics data yet</h2>
          <p className="mx-auto max-w-md text-slate-600">
            Analytics are generated from your imported Excel data. Upload your workbook with ICU, Family Medicine, and Emergency tabs to see charts and department breakdowns here.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
          >
            <Upload className="h-4 w-4" />
            Upload Excel workbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Analytics</h1>
        <p className="text-slate-600">Insights from your imported data (ICU, Family Medicine, Emergency)</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {assetByDeptChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Asset count by department</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetByDeptChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {mostRequestedChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Most requested items</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostRequestedChart} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {departmentChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Requests by department</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0369a1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {statusPie.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Asset status distribution</h2>
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
        {requestPie.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Request status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {requestPie.map((_, i) => (
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

        {categoryChart.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Inventory by category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {vendorMatchChart.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Vendor coverage by category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorMatchChart} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
