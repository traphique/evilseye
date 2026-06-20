"use client";

import { create } from "zustand";
import type { SyncResult, ThreatEvent, ThreatSeverity } from "@/lib/types";

interface ThreatStore {
  threats: ThreatEvent[];
  stats: SyncResult["stats"] | null;
  lastSync: string | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  selectedId: string | null;
  search: string;
  severityFilter: ThreatSeverity | "all";
  sourceFilter: "all" | "cisa-kev" | "nvd";
  setSearch: (search: string) => void;
  setSeverityFilter: (severity: ThreatSeverity | "all") => void;
  setSourceFilter: (source: "all" | "cisa-kev" | "nvd") => void;
  selectThreat: (id: string | null) => void;
  fetchThreats: () => Promise<void>;
  syncAndNotify: () => Promise<SyncResult | null>;
}

export const useThreatStore = create<ThreatStore>((set) => ({
  threats: [],
  stats: null,
  lastSync: null,
  loading: true,
  syncing: false,
  error: null,
  selectedId: null,
  search: "",
  severityFilter: "all",
  sourceFilter: "all",

  setSearch: (search) => set({ search }),
  setSeverityFilter: (severityFilter) => set({ severityFilter }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  selectThreat: (selectedId) => set({ selectedId }),

  fetchThreats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/threats");
      if (!res.ok) throw new Error("Failed to load threats");
      const data = (await res.json()) as SyncResult;
      set({
        threats: data.threats,
        stats: data.stats,
        lastSync: data.lastSync,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  syncAndNotify: async () => {
    set({ syncing: true, error: null });
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as SyncResult;
      set({
        threats: data.threats,
        stats: data.stats,
        lastSync: data.lastSync,
        syncing: false,
      });
      return data;
    } catch (error) {
      set({
        syncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      });
      return null;
    }
  },
}));

export function useFilteredThreats() {
  const { threats, search, severityFilter, sourceFilter } = useThreatStore();
  const q = search.toLowerCase().trim();

  return threats.filter((t) => {
    if (severityFilter !== "all" && t.severity !== severityFilter) return false;
    if (sourceFilter !== "all" && t.source !== sourceFilter) return false;
    if (!q) return true;
    return (
      t.cveId.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.vendor?.toLowerCase().includes(q) ?? false)
    );
  });
}