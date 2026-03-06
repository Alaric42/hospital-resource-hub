"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Package, Upload } from "lucide-react";
import Link from "next/link";
import { EXPECTED_DEPARTMENTS } from "@/lib/mockData";

export default function InventoryPage() {
  const { assets } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const categories = Array.from(new Set(assets.map((a) => a.category))).filter(Boolean).sort();
  const filtered = assets.filter((a) => {
    const matchSearch =
      !search ||
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a.assetId.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || a.category === categoryFilter;
    const matchDept = !departmentFilter || a.department === departmentFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchCat && matchDept && matchStatus;
  });

  const isEmpty = assets.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Asset Inventory</h1>
        <p className="text-slate-600">
          All assets imported from Excel, organized by ICU, Family Medicine, and Emergency
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-800">No inventory records available yet</h2>
          <p className="mx-auto max-w-md text-slate-600">
            Upload your Excel workbook with ICU, Family Medicine, and Emergency tabs to see your asset records here.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
          >
            <Upload className="h-4 w-4" />
            Upload Excel workbook
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-hospital-teal focus:outline-none focus:ring-1 focus:ring-hospital-teal"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-hospital-teal focus:outline-none"
            >
              <option value="">All departments</option>
              {EXPECTED_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-hospital-teal focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-hospital-teal focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Package className="mb-4 h-12 w-12 text-slate-300" />
                <p className="font-medium">No assets match your filters</p>
                <p className="text-sm">Try changing the department, category, or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-slate-600">
                      <th className="px-4 py-3 font-medium">Asset ID</th>
                      <th className="px-4 py-3 font-medium">Asset Name</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Threshold</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Unit Cost</th>
                      <th className="px-4 py-3 font-medium">Condition</th>
                      <th className="px-4 py-3 font-medium">Funding</th>
                      <th className="px-4 py-3 font-medium">Last Updated</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-slate-700">{a.assetId}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{a.assetName}</td>
                        <td className="px-4 py-3 text-slate-600">{a.category}</td>
                        <td className="px-4 py-3 text-slate-600">{a.department}</td>
                        <td className="px-4 py-3">{a.quantityAvailable}</td>
                        <td className="px-4 py-3">{a.minimumThreshold}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3">{formatCurrency(a.unitCost)}</td>
                        <td className="px-4 py-3 text-slate-600">{a.currentCondition}</td>
                        <td className="px-4 py-3 text-slate-600">{a.fundingSource}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(a.lastUpdated)}</td>
                        <td className="max-w-[180px] truncate px-4 py-3 text-slate-500" title={a.notes}>
                          {a.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
