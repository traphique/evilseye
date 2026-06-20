import { fetchCisaKev } from "./fetchers/cisa-kev";
import { fetchRecentNvdCves } from "./fetchers/nvd";
import { sendDiscordWebhook } from "./discord";
import { loadSeenThreatIds, markThreatsSeen } from "./store/seen-threats";
import { severityRank } from "./severity";
import type { AlertSettings, SyncResult, ThreatEvent, ThreatStats } from "./types";

function dedupeThreats(threats: ThreatEvent[]): ThreatEvent[] {
  const map = new Map<string, ThreatEvent>();
  for (const threat of threats) {
    const existing = map.get(threat.cveId);
    if (!existing || severityRank(threat.severity) > severityRank(existing.severity)) {
      map.set(threat.cveId, threat);
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function computeStats(threats: ThreatEvent[]): ThreatStats {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return {
    total: threats.length,
    critical: threats.filter((t) => t.severity === "critical").length,
    high: threats.filter((t) => t.severity === "high").length,
    kev: threats.filter((t) => t.source === "cisa-kev").length,
    last24h: threats.filter((t) => new Date(t.publishedAt).getTime() > dayAgo).length,
  };
}

function matchesAlertRules(threat: ThreatEvent, settings: AlertSettings): boolean {
  if (threat.source === "cisa-kev" && !settings.notifyKev) return false;
  if (threat.source === "nvd" && !settings.notifyNvd) return false;
  if (severityRank(threat.severity) < severityRank(settings.minSeverity)) return false;

  if (settings.keywords.length > 0) {
    const haystack = `${threat.title} ${threat.description} ${threat.vendor ?? ""} ${threat.product ?? ""}`.toLowerCase();
    const match = settings.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
    if (!match) return false;
  }

  return true;
}

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  minSeverity: "high",
  notifyKev: true,
  notifyNvd: true,
  keywords: [],
};

export async function syncThreats(options?: {
  notify?: boolean;
  markSeen?: boolean;
  alertSettings?: AlertSettings;
}): Promise<SyncResult> {
  const notify = options?.notify ?? true;
  const markSeen = options?.markSeen ?? notify;
  const alertSettings = options?.alertSettings ?? DEFAULT_ALERT_SETTINGS;

  const results = await Promise.allSettled([fetchCisaKev(), fetchRecentNvdCves()]);
  const fetched: ThreatEvent[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") fetched.push(...result.value);
  }

  const threats = dedupeThreats(fetched);
  const seen = await loadSeenThreatIds();
  const newThreats = threats.filter((t) => !seen.has(t.id));

  let notified = 0;
  if (notify && newThreats.length > 0) {
    const alertable = newThreats.filter((t) => matchesAlertRules(t, alertSettings));
    if (alertable.length > 0) {
      const result = await sendDiscordWebhook(alertable);
      notified = result.sent;
    }
  }

  if (markSeen && newThreats.length > 0) {
    await markThreatsSeen(newThreats.map((t) => t.id));
  }

  return {
    fetched: threats.length,
    newThreats: newThreats.length,
    notified,
    threats,
    stats: computeStats(threats),
    lastSync: new Date().toISOString(),
  };
}