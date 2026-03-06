"use client";

import { useApp } from "@/context/AppContext";
import { RequestStatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export default function StaffRequestsPage() {
  const { requests } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">My requests</h1>
        <p className="text-slate-600">Track status of your submitted requests</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <ClipboardList className="mb-4 h-12 w-12 text-slate-300" />
            <p className="font-medium">No requests yet</p>
            <p className="text-sm">Submit a request from the Report page.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50">
                <div>
                  <p className="font-medium text-slate-900">{r.itemName}</p>
                  <p className="text-sm text-slate-500">
                    {r.quantityNeeded} · {r.department} · {formatDate(r.submittedAt)}
                  </p>
                  {r.notes && (
                    <p className="mt-1 text-sm text-slate-600">{r.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <UrgencyBadge urgency={r.urgency} />
                  <RequestStatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
