"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  UserRole,
  Asset,
  StaffRequest,
  Vendor,
} from "@/lib/types";

interface AppContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  addAssets: (newAssets: Asset[]) => void;
  requests: StaffRequest[];
  addRequest: (req: Omit<StaffRequest, "id" | "submittedAt">) => void;
  updateRequestStatus: (id: string, status: StaffRequest["status"]) => void;
  vendors: Vendor[];
  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, v: Partial<Vendor>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  /** Replace all assets (used when importing Excel workbook). */
  const addAssets = useCallback((newAssets: Asset[]) => {
    setAssets(newAssets);
  }, []);

  const addRequest = useCallback(
    (req: Omit<StaffRequest, "id" | "submittedAt">) => {
      const newReq: StaffRequest = {
        ...req,
        id: `r-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      setRequests((prev) => [newReq, ...prev]);
    },
    []
  );

  const updateRequestStatus = useCallback(
    (id: string, status: StaffRequest["status"]) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    },
    []
  );

  const addVendor = useCallback(
    (v: Omit<Vendor, "id" | "createdAt">) => {
      const newV: Vendor = {
        ...v,
        id: `v-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setVendors((prev) => [newV, ...prev]);
    },
    []
  );

  const updateVendor = useCallback((id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  }, []);

  const value: AppContextType = {
    userRole,
    setUserRole,
    assets,
    setAssets,
    addAssets,
    requests,
    addRequest,
    updateRequestStatus,
    vendors,
    addVendor,
    updateVendor,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
