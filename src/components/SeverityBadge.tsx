import { severityColor, severityLabel } from "@/lib/severity";
import type { ThreatSeverity } from "@/lib/types";

interface SeverityBadgeProps {
  severity: ThreatSeverity;
  compact?: boolean;
}

export function SeverityBadge({ severity, compact }: SeverityBadgeProps) {
  const color = severityColor(severity);
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {severityLabel(severity)}
    </span>
  );
}