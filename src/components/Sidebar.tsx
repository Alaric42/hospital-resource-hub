"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Upload,
  Package,
  ClipboardList,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  Truck,
  Stethoscope,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Excel Upload", icon: Upload },
  { href: "/inventory", label: "Asset Inventory", icon: Package },
  { href: "/requests", label: "Requests & Alerts", icon: ClipboardList },
  { href: "/match", label: "Match Shortages", icon: Link2 },
  { href: "/vendors", label: "Vendor Directory", icon: Building2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const VENDOR_LINKS = [
  { href: "/vendor/profile", label: "My Profile", icon: UserCircle },
  { href: "/vendors", label: "Directory", icon: Building2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const STAFF_LINKS = [
  { href: "/staff", label: "Report Usage / Request", icon: Stethoscope },
  { href: "/staff/requests", label: "My Requests", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, setUserRole } = useApp();

  const links =
    userRole === "admin"
      ? ADMIN_LINKS
      : userRole === "vendor"
        ? VENDOR_LINKS
        : STAFF_LINKS;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hospital-teal text-white">
            <Truck className="h-5 w-5" />
          </div>
          <span className="font-semibold text-hospital-navy">Resource Hub</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-hospital-teal/10 text-hospital-teal"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => setUserRole(null)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" />
            Switch role
          </button>
        </div>
      </div>
    </aside>
  );
}
