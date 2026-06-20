export type ThreatSeverity = "critical" | "high" | "medium" | "low" | "unknown";

export type ThreatSource = "cisa-kev" | "nvd";

export interface ThreatEvent {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  source: ThreatSource;
  cvss?: number;
  vendor?: string;
  product?: string;
  aptGroup?: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  requiredAction?: string;
  publishedAt: string;
  updatedAt: string;
  url: string;
  tags: string[];
}

export interface ThreatStats {
  total: number;
  critical: number;
  high: number;
  kev: number;
  last24h: number;
}

export interface SyncResult {
  fetched: number;
  newThreats: number;
  notified: number;
  threats: ThreatEvent[];
  stats: ThreatStats;
  lastSync: string;
}

export interface AlertSettings {
  minSeverity: ThreatSeverity;
  notifyKev: boolean;
  notifyNvd: boolean;
  keywords: string[];
}