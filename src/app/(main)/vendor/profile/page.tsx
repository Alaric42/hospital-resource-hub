"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Building2, Save } from "lucide-react";

const ORG_TYPES = ["vendor", "nonprofit", "donor", "partner"] as const;

export default function VendorProfilePage() {
  const { vendors, addVendor, userRole } = useApp();
  const myVendor = vendors[0]; // In a real app, filter by current user
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    organizationName: myVendor?.organizationName ?? "",
    organizationType: (myVendor?.organizationType ?? "nonprofit") as (typeof ORG_TYPES)[number],
    description: myVendor?.description ?? "",
    productsOffered: myVendor?.productsOffered?.join(", ") ?? "",
    servicesOffered: myVendor?.servicesOffered?.join(", ") ?? "",
    categoriesSupported: myVendor?.categoriesSupported?.join(", ") ?? "",
    region: myVendor?.region ?? "",
    contactEmail: myVendor?.contactEmail ?? "",
    contactPhone: myVendor?.contactPhone ?? "",
    availabilityNotes: myVendor?.availabilityNotes ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      organizationName: form.organizationName,
      organizationType: form.organizationType,
      description: form.description,
      productsOffered: form.productsOffered.split(",").map((s) => s.trim()).filter(Boolean),
      servicesOffered: form.servicesOffered.split(",").map((s) => s.trim()).filter(Boolean),
      categoriesSupported: form.categoriesSupported.split(",").map((s) => s.trim()).filter(Boolean),
      region: form.region,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      availabilityNotes: form.availabilityNotes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Vendor Profile</h1>
        <p className="text-slate-600">
          Create or update your organization profile so hospitals can discover your offerings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Organization name</label>
            <input
              type="text"
              required
              value={form.organizationName}
              onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none focus:ring-1 focus:ring-hospital-teal"
              placeholder="Your organization name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Organization type</label>
            <select
              value={form.organizationType}
              onChange={(e) => setForm((f) => ({ ...f, organizationType: e.target.value as (typeof ORG_TYPES)[number] }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            >
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Region / service area</label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
              placeholder="e.g. Northeast, Statewide"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none focus:ring-1 focus:ring-hospital-teal"
            placeholder="Describe your products and services..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Products offered (comma-separated)</label>
          <input
            type="text"
            value={form.productsOffered}
            onChange={(e) => setForm((f) => ({ ...f, productsOffered: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="e.g. PPE Kits, N95 Masks, Gloves"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Services offered (comma-separated)</label>
          <input
            type="text"
            value={form.servicesOffered}
            onChange={(e) => setForm((f) => ({ ...f, servicesOffered: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="e.g. Donation coordination, Delivery"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Categories supported</label>
          <input
            type="text"
            value={form.categoriesSupported}
            onChange={(e) => setForm((f) => ({ ...f, categoriesSupported: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="e.g. PPE & Supplies, Life Support"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contact email</label>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contact phone</label>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Availability / eligibility notes</label>
          <textarea
            rows={2}
            value={form.availabilityNotes}
            onChange={(e) => setForm((f) => ({ ...f, availabilityNotes: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="e.g. 2–3 week lead time. Priority for critical shortage areas."
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
