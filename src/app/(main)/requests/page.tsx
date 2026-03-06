"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { StaffRequest } from "@/lib/types";
import { UrgencyBadge, RequestStatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ClipboardList, ChevronDown } from "lucide-react";
import { EXPECTED_DEPARTMENTS } from "@/lib/mockData";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "New", label: "New" },
  { value: "Under Review", label: "Under Review" },
  { value: "Approved", label: "Approved" },
  { value: "Ordered", label: "Ordered" },
  { value: "Fulfilled", label: "Fulfilled" },
  { value: "Denied", label: "Denied" },
];

export default function RequestsPage() {
  const { requests, updateRequestStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = requests.filter((r) => {
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchUrgency = !urgencyFilter || r.urgency === urgencyFilter;
    const matchDept = !departmentFilter || r.department === departmentFilter;
    return matchStatus && matchUrgency && matchDept;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Requests & Alerts</h1>
        <p className="text-slate-600">Review and manage requests from doctors and nurses (ICU, Family Medicine, Emergency)</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="font-medium text-slate-700">No requests yet</p>
          <p className="text-sm text-slate-500">When doctors and nurses submit usage or shortage reports, they will appear here.</p>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap gap-4">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All departments</option>
          {EXPECTED_DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">All urgency</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <ClipboardList className="mb-4 h-12 w-12 text-slate-300" />
            <p className="font-medium">No requests match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-slate-600">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium">Submitted by</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.itemName}</p>
                      {r.notes && (
                        <p className="max-w-[200px] truncate text-xs text-slate-500" title={r.notes}>
                          {r.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.quantityNeeded}</td>
                    <td className="px-4 py-3">{r.department}</td>
                    <td className="px-4 py-3">
                      <UrgencyBadge urgency={r.urgency} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.submittedBy}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.submittedAt)}</td>
                    <td className="px-4 py-3">
                      {editingId === r.id ? (
                        <select
                          value={r.status}
                          onChange={(e) => {
                            updateRequestStatus(r.id, e.target.value as StaffRequest["status"]);
                            setEditingId(null);
                          }}
                          onBlur={() => setEditingId(null)}
                          className="rounded border border-slate-200 py-1 text-xs focus:border-hospital-teal focus:outline-none"
                          autoFocus
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingId(r.id)}
                          className="flex items-center gap-1 hover:opacity-80"
                        >
                          <RequestStatusBadge status={r.status} />
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                        className="text-xs font-medium text-hospital-teal hover:underline"
                      >
                        {editingId === r.id ? "Done" : "Change status"}
                      </button>
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
