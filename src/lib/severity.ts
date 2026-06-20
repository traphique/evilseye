import type { ThreatSeverity } from "./types";

export function cvssToSeverity(score?: number): ThreatSeverity {
  if (score == null || Number.isNaN(score)) return "unknown";
  if (score >= 9.0) return "critical";
  if (score >= 7.0) return "high";
  if (score >= 4.0) return "medium";
  return "low";
}

export function severityRank(severity: ThreatSeverity): number {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

export function severityColor(severity: ThreatSeverity): string {
  switch (severity) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#eab308";
    case "low":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

export function severityLabel(severity: ThreatSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}