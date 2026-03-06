"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Building2, Search, MapPin, Mail } from "lucide-react";

export default function VendorsPage() {
  const { vendors } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const categories = Array.from(
    new Set(vendors.flatMap((v) => v.categoriesSupported))
  ).sort();
  const filtered = vendors.filter((v) => {
    const matchSearch =
      !search ||
      v.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.categoriesSupported.some((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      );
    const matchCat =
      !categoryFilter || v.categoriesSupported.includes(categoryFilter);
    const matchType = !typeFilter || v.organizationType === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Vendor Directory</h1>
        <p className="text-slate-600">
          Discover vendors and nonprofits that can help address shortages
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-hospital-teal focus:outline-none focus:ring-1 focus:ring-hospital-teal"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All types</option>
          <option value="vendor">Vendor</option>
          <option value="nonprofit">Nonprofit</option>
          <option value="donor">Donor</option>
          <option value="partner">Partner</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hospital-teal/10 text-hospital-teal">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{v.organizationName}</h3>
                  <span className="text-xs capitalize text-slate-500">{v.organizationType}</span>
                </div>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-slate-600">{v.description}</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {v.categoriesSupported.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {v.region}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              <a href={`mailto:${v.contactEmail}`} className="text-hospital-teal hover:underline">
                {v.contactEmail}
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-500">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="font-medium">No vendors match your filters</p>
        </div>
      )}
    </div>
  );
}
