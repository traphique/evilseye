"use client";

import { ThreatCard } from "./ThreatCard";
import type { ThreatEvent } from "@/lib/types";

interface ThreatFeedProps {
  threats: ThreatEvent[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
}

export function ThreatFeed({ threats, selectedId, loading, onSelect }: ThreatFeedProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  if (threats.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-zinc-400">No threats match your filters.</p>
        <p className="mt-1 text-xs text-zinc-600">Try adjusting search or severity filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-4">
      {threats.map((threat) => (
        <ThreatCard
          key={threat.id}
          threat={threat}
          selected={threat.id === selectedId}
          onClick={() => onSelect(threat.id)}
        />
      ))}
    </div>
  );
}