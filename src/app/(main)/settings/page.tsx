"use client";

import { useApp } from "@/context/AppContext";
import { Building2, Truck, Stethoscope } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { userRole } = useApp();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Settings</h1>
        <p className="text-slate-600">Account and app preferences</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Current role</h2>
        <p className="mb-4 text-sm text-slate-600">
          You are signed in as{" "}
          <span className="font-medium capitalize">{userRole}</span>. Switch role from the sidebar to view the app as another user type.
        </p>
        <div className="flex gap-2">
          {userRole === "admin" && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal/10 px-3 py-2 text-sm text-hospital-teal">
              <Building2 className="h-4 w-4" />
              Hospital Administration
            </span>
          )}
          {userRole === "vendor" && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal/10 px-3 py-2 text-sm text-hospital-teal">
              <Truck className="h-4 w-4" />
              Vendor / Nonprofit
            </span>
          )}
          {userRole === "staff" && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal/10 px-3 py-2 text-sm text-hospital-teal">
              <Stethoscope className="h-4 w-4" />
              Doctor / Nurse
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">About</h2>
        <p className="text-sm text-slate-600">
          Hospital Resource Hub is a prototype for managing assets, inventory, staff requests, and vendor coordination. Data is stored in memory for this session.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-hospital-teal hover:underline">
          Back to role selection
        </Link>
      </div>
    </div>
  );
}
