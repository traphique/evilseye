import type { ThreatStats } from "@/lib/types";

interface StatsBarProps {
  stats: ThreatStats | null;
}

const items = [
  { key: "total" as const, label: "Total", color: "text-zinc-200" },
  { key: "critical" as const, label: "Critical", color: "text-red-400" },
  { key: "high" as const, label: "High", color: "text-orange-400" },
  { key: "kev" as const, label: "CISA KEV", color: "text-cyan-400" },
  { key: "last24h" as const, label: "Last 24h", color: "text-emerald-400" },
];

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex min-w-[90px] flex-col rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
          <span className={`font-mono text-lg font-semibold ${color}`}>
            {stats ? stats[key] : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}