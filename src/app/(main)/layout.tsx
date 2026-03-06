"use client";

import { useApp } from "@/context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const isVendorRoute = pathname?.startsWith("/vendor") ?? false;
  const adminOnlyPaths = ["/dashboard", "/upload", "/inventory", "/requests", "/match", "/analytics"];
  const isAdminOnly = pathname && adminOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (userRole == null) {
      router.replace("/");
      return;
    }
    if (userRole === "admin" && isVendorRoute && pathname !== "/vendors") {
      router.replace("/dashboard");
      return;
    }
    if (userRole === "vendor" && pathname?.startsWith("/dashboard")) {
      router.replace("/vendor/profile");
      return;
    }
    if (userRole === "staff" && isAdminOnly) {
      router.replace("/staff");
      return;
    }
  }, [userRole, pathname, isVendorRoute, isAdminOnly, router]);

  if (userRole == null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
