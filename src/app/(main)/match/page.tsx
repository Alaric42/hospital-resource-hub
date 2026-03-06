"use client";

import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function MatchPage() {
  const { assets, vendors } = useApp();

  const shortages = assets.filter(
    (a) => a.status === "Low Stock" || a.status === "Out of Stock"
  );

  function matchVendors(category: string) {
    return vendors.filter((v) =>
      v.categoriesSupported.some(
        (c) =>
          c.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(c.toLowerCase())
      )
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Match shortages to vendors</h1>
        <p className="text-slate-600">
          See which vendors and nonprofits can help with each shortage
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="font-medium text-slate-700">No hospital data uploaded yet</p>
          <p className="mt-1 text-sm text-slate-500">Upload your Excel workbook with ICU, General Medicine, and Emergency tabs. Shortages will appear here once data is imported.</p>
          <Link href="/upload" className="mt-4 inline-block text-sm font-medium text-hospital-teal hover:underline">Upload Excel workbook</Link>
        </div>
      ) : shortages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">
          <p className="font-medium">No current shortages</p>
          <p className="text-sm">When assets are low or out of stock, they will appear here with recommended vendors.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {shortages.map((asset) => {
            const recommended = matchVendors(asset.category);
            return (
              <div
                key={asset.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">{asset.assetName}</h2>
                      <p className="text-sm text-slate-500">
                        {asset.category} · {asset.department} · Qty: {asset.quantityAvailable} / threshold {asset.minimumThreshold}
                      </p>
                    </div>
                    <StatusBadge status={asset.status} />
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">
                    Recommended vendors / nonprofits
                  </p>
                  {recommended.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No vendors in the directory support this category yet.{" "}
                      <Link href="/vendors" className="text-hospital-teal hover:underline">
                        Browse directory
                      </Link>
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {recommended.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4 hover:border-hospital-teal/30"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hospital-teal/10 text-hospital-teal">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900">{v.organizationName}</p>
                            <p className="text-xs capitalize text-slate-500">{v.organizationType}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {v.region}
                              </span>
                              <a
                                href={`mailto:${v.contactEmail}`}
                                className="flex items-center gap-1 text-hospital-teal hover:underline"
                              >
                                <Mail className="h-3 w-3" />
                                Contact
                              </a>
                              {v.contactPhone && (
                                <a href={`tel:${v.contactPhone}`} className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {v.contactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
