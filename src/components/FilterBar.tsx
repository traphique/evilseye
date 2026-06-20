"use client";

import type { ThreatSeverity } from "@/lib/types";

interface FilterBarProps {
  search: string;
  severityFilter: ThreatSeverity | "all";
  sourceFilter: "all" | "cisa-kev" | "nvd";
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: ThreatSeverity | "all") => void;
  onSourceChange: (value: "all" | "cisa-kev" | "nvd") => void;
}

const severities: (ThreatSeverity | "all")[] = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];

export function FilterBar({
  search,
  severityFilter,
  sourceFilter,
  onSearchChange,
  onSeverityChange,
  onSourceChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/8 p-4">
      <div className="relative">
        <input
          type="search"
          placeholder="Search CVE, vendor, keyword…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 pl-10 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        {severities.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSeverityChange(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              severityFilter === s
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {s === "all" ? "All severity" : s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["all", "cisa-kev", "nvd"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSourceChange(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sourceFilter === s
                ? "bg-white/15 text-zinc-200"
                : "bg-white/5 text-zinc-500 hover:bg-white/10"
            }`}
          >
            {s === "all" ? "All sources" : s === "cisa-kev" ? "CISA KEV" : "NVD"}
          </button>
        ))}
      </div>
    </div>
  );
}