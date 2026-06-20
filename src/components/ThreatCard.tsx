"use client";

import { formatDistanceToNow } from "date-fns";
import { SeverityBadge } from "./SeverityBadge";
import type { ThreatEvent } from "@/lib/types";

interface ThreatCardProps {
  threat: ThreatEvent;
  selected: boolean;
  onClick: () => void;
}

export function ThreatCard({ threat, selected, onClick }: ThreatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-cyan-300">
            {threat.cveId}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {threat.vendor ?? "Unknown vendor"}
            {threat.product ? ` · ${threat.product}` : ""}
          </p>
        </div>
        <SeverityBadge severity={threat.severity} compact />
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-300">
        {threat.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
          {threat.source === "cisa-kev" ? "CISA KEV" : "NVD"}
        </span>
        {threat.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300/80"
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-zinc-500">
          {formatDistanceToNow(new Date(threat.publishedAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}