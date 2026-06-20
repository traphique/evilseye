import { severityLabel } from "./severity";
import type { ThreatEvent } from "./types";

const DISCORD_EMBED_COLORS: Record<string, number> = {
  critical: 0xef4444,
  high: 0xf97316,
  medium: 0xeab308,
  low: 0x3b82f6,
  unknown: 0x6b7280,
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export function buildThreatEmbed(threat: ThreatEvent) {
  const fields = [
    { name: "Severity", value: severityLabel(threat.severity), inline: true },
    { name: "Source", value: threat.source === "cisa-kev" ? "CISA KEV" : "NVD", inline: true },
  ];

  if (threat.cvss != null) {
    fields.push({ name: "CVSS", value: String(threat.cvss), inline: true });
  }
  if (threat.vendor) {
    fields.push({ name: "Vendor", value: threat.vendor, inline: true });
  }
  if (threat.product) {
    fields.push({ name: "Product", value: threat.product, inline: true });
  }
  if (threat.country) {
    fields.push({ name: "Region", value: threat.country, inline: true });
  }
  if (threat.requiredAction) {
    fields.push({
      name: "Required Action",
      value: truncate(threat.requiredAction, 256),
      inline: false,
    });
  }

  return {
    title: `🚨 ${threat.cveId}`,
    description: truncate(threat.description, 300),
    url: threat.url,
    color: DISCORD_EMBED_COLORS[threat.severity] ?? 0x6b7280,
    fields,
    footer: { text: "EvilsEye Threat Alert" },
    timestamp: threat.updatedAt || threat.publishedAt,
  };
}

export async function sendDiscordWebhook(
  threats: ThreatEvent[],
  webhookUrl?: string,
): Promise<{ sent: number; error?: string }> {
  const url = webhookUrl ?? process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    return { sent: 0, error: "DISCORD_WEBHOOK_URL not configured" };
  }

  if (threats.length === 0) return { sent: 0 };

  const batch = threats.slice(0, 10);
  const embeds = batch.map(buildThreatEmbed);

  const content =
    threats.length === 1
      ? `**New threat detected:** ${threats[0].cveId}`
      : `**${threats.length} new threats detected** on EvilsEye`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, embeds }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { sent: 0, error: `Discord webhook failed (${res.status}): ${body}` };
  }

  return { sent: batch.length };
}

export async function sendTestNotification(webhookUrl?: string) {
  const testThreat: ThreatEvent = {
    id: "test-evilseye",
    cveId: "CVE-TEST-0001",
    title: "EvilsEye Test Alert",
    description:
      "Discord webhook is configured correctly. You will receive alerts when new CVEs and KEV entries are detected.",
    severity: "high",
    source: "nvd",
    cvss: 8.5,
    vendor: "EvilsEye",
    country: "Global",
    countryCode: "GL",
    lat: 0,
    lng: 0,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: "https://github.com/traphique/evilseye",
    tags: ["Test"],
  };

  return sendDiscordWebhook([testThreat], webhookUrl);
}