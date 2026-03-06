"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle } from "lucide-react";
import { EXPECTED_DEPARTMENTS } from "@/lib/mockData";

const URGENCY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

export default function StaffPage() {
  const { assets, addRequest } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: "request" as "usage" | "shortage" | "request",
    itemName: "",
    quantityNeeded: 1,
    department: "",
    urgency: "Medium" as (typeof URGENCY_OPTIONS)[number],
    notes: "",
    submittedBy: "",
  });

  const itemSuggestions = Array.from(new Set(assets.map((a) => a.assetName)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      itemName: form.itemName,
      quantityNeeded: form.quantityNeeded,
      department: form.department,
      urgency: form.urgency,
      notes: form.notes,
      submittedBy: form.submittedBy.trim() || "Staff",
      status: "New",
      type: form.type,
    });
    setSubmitted(true);
    setForm((f) => ({
      ...f,
      itemName: "",
      quantityNeeded: 1,
      notes: "",
    }));
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Report usage or request supplies</h1>
        <p className="text-slate-600">
          Log what you used or report a shortage. Administration will be notified.
        </p>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle className="h-5 w-5" />
          <span>Request submitted. Administration has been notified.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">What do you want to do?</label>
          <div className="flex gap-4">
            {(["request", "shortage", "usage"] as const).map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={form.type === t}
                  onChange={() => setForm((f) => ({ ...f, type: t }))}
                  className="text-hospital-teal focus:ring-hospital-teal"
                />
                <span className="text-sm capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Item</label>
          <input
            type="text"
            list="items"
            required
            value={form.itemName}
            onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none focus:ring-1 focus:ring-hospital-teal"
            placeholder="e.g. PPE Kits, IV Pumps"
          />
          <datalist id="items">
            {itemSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Quantity needed / used</label>
          <input
            type="number"
            min={1}
            value={form.quantityNeeded}
            onChange={(e) => setForm((f) => ({ ...f, quantityNeeded: parseInt(e.target.value, 10) || 1 }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
          <select
            required
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
          >
            <option value="">Select department</option>
            {EXPECTED_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Urgency</label>
          <select
            value={form.urgency}
            onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as (typeof URGENCY_OPTIONS)[number] }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Your name (optional)</label>
          <input
            type="text"
            value={form.submittedBy}
            onChange={(e) => setForm((f) => ({ ...f, submittedBy: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-hospital-teal focus:outline-none"
            placeholder="e.g. Emergency department depleted."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-hospital-teal py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
