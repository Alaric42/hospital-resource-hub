"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, Truck, Stethoscope } from "lucide-react";

export default function HomePage() {
  const { userRole, setUserRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (userRole === "admin") router.replace("/dashboard");
    else if (userRole === "vendor") router.replace("/vendor/profile");
    else if (userRole === "staff") router.replace("/staff");
  }, [userRole, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hospital-soft via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-hospital-teal text-white shadow-lg">
          <Building2 className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-hospital-navy sm:text-4xl">
          Hospital Resource Hub
        </h1>
        <p className="mb-12 text-slate-600">
          Manage assets, report shortages, and connect with vendors — all in one place.
        </p>
        <p className="mb-6 text-sm font-medium text-slate-500">
          Select your role to continue
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => {
              setUserRole("admin");
              router.push("/dashboard");
            }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-hospital-teal hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-hospital-teal/10 text-hospital-teal group-hover:bg-hospital-teal group-hover:text-white transition-colors">
              <Building2 className="h-7 w-7" />
            </div>
            <span className="font-semibold text-slate-800">Hospital Administration</span>
            <span className="text-sm text-slate-500">Dashboard, Excel import, inventory, requests</span>
          </button>
          <button
            onClick={() => {
              setUserRole("vendor");
              router.push("/vendor/profile");
            }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-hospital-teal hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-hospital-teal/10 text-hospital-teal group-hover:bg-hospital-teal group-hover:text-white transition-colors">
              <Truck className="h-7 w-7" />
            </div>
            <span className="font-semibold text-slate-800">Vendor / Nonprofit</span>
            <span className="text-sm text-slate-500">Create profile, list offerings</span>
          </button>
          <button
            onClick={() => {
              setUserRole("staff");
              router.push("/staff");
            }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-hospital-teal hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-hospital-teal/10 text-hospital-teal group-hover:bg-hospital-teal group-hover:text-white transition-colors">
              <Stethoscope className="h-7 w-7" />
            </div>
            <span className="font-semibold text-slate-800">Doctor / Nurse</span>
            <span className="text-sm text-slate-500">Report usage, request supplies</span>
          </button>
        </div>
      </div>
    </div>
  );
}
