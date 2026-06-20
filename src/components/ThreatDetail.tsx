"use client";

import { format } from "date-fns";
import { SeverityBadge } from "./SeverityBadge";
import type { ThreatEvent } from "@/lib/types";

interface ThreatDetailProps {
  threat: ThreatEvent | null;
  onClose: () => void;
}

export function ThreatDetail({ threat, onClose }: ThreatDetailProps) {
  if (!threat) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 max-h-[45%] overflow-y-auto border-t border-cyan-500/20 bg-[#0a0f18]/95 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-lg font-bold text-cyan-300">{threat.cveId}</h2>
            <SeverityBadge severity={threat.severity} />
          </div>
          <p className="mt-1 text-sm text-zinc-400">{threat.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/5"
        >
          Close
        </button>
      </div>

      <p className="text-sm leading-relaxed text-zinc-300">{threat.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {threat.cvss != null && (
          <div>
            <p className="text-[10px] uppercase text-zinc-500">CVSS</p>
            <p className="font-mono text-zinc-200">{threat.cvss}</p>
          </div>
        )}
        {threat.vendor && (
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Vendor</p>
            <p className="text-zinc-200">{threat.vendor}</p>
          </div>
        )}
        {threat.product && (
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Product</p>
            <p className="text-zinc-200">{threat.product}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] uppercase text-zinc-500">Region</p>
          <p className="text-zinc-200">{threat.country}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500">Published</p>
          <p className="text-zinc-200">
            {format(new Date(threat.publishedAt), "MMM d, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500">Source</p>
          <p className="text-zinc-200">
            {threat.source === "cisa-kev" ? "CISA KEV" : "NVD"}
          </p>
        </div>
      </div>

      {threat.requiredAction && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[10px] uppercase text-amber-400/80">Required Action</p>
          <p className="mt-1 text-sm text-amber-100/90">{threat.requiredAction}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {threat.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-white/5 px-2 py-1 text-xs text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <a
        href={threat.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/30"
      >
        View on NVD
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}