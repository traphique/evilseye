import { resolveGeo } from "../geo";
import { cvssToSeverity, severityRank } from "../severity";
import type { ThreatEvent } from "../types";

interface NvdCveItem {
  cve: {
    id: string;
    published: string;
    lastModified: string;
    descriptions: { lang: string; value: string }[];
    metrics?: {
      cvssMetricV31?: {
        cvssData: { baseScore: number; baseSeverity: string };
      }[];
      cvssMetricV30?: {
        cvssData: { baseScore: number; baseSeverity: string };
      }[];
    };
    references?: { url: string; tags?: string[] }[];
    weaknesses?: { description: { value: string }[] }[];
  };
}

interface NvdResponse {
  vulnerabilities: NvdCveItem[];
  totalResults: number;
}

function extractCvss(item: NvdCveItem): number | undefined {
  const v31 = item.cve.metrics?.cvssMetricV31?.[0]?.cvssData.baseScore;
  if (v31 != null) return v31;
  return item.cve.metrics?.cvssMetricV30?.[0]?.cvssData.baseScore;
}

function extractVendor(description: string): string | undefined {
  const match = description.match(/\b(Microsoft|Apple|Google|Cisco|Oracle|Adobe|VMware|Fortinet|Apache|Linux|WordPress|Atlassian|Citrix|SAP|Juniper)\b/i);
  return match?.[1];
}

export async function fetchRecentNvdCves(): Promise<ThreatEvent[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    pubStartDate: start.toISOString(),
    pubEndDate: end.toISOString(),
    resultsPerPage: "40",
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.NVD_API_KEY) {
    headers["apiKey"] = process.env.NVD_API_KEY;
  }

  const res = await fetch(
    `https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`,
    { next: { revalidate: 600 }, headers },
  );

  if (!res.ok) {
    throw new Error(`NVD fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as NvdResponse;

  const threats: ThreatEvent[] = [];

  for (const item of data.vulnerabilities) {
    const cvss = extractCvss(item);
    const severity = cvssToSeverity(cvss);
    if (severityRank(severity) < severityRank("high")) continue;

    const description =
      item.cve.descriptions.find((d) => d.lang === "en")?.value ?? "No description";
    const vendor = extractVendor(description);
    const geo = resolveGeo(vendor, item.cve.id);
    const tags = ["NVD"];
    if (cvss != null && cvss >= 9) tags.push("Critical CVSS");

    threats.push({
      id: `nvd-${item.cve.id}`,
      cveId: item.cve.id,
      title: `${item.cve.id} — ${severity.toUpperCase()}`,
      description: description.slice(0, 500),
      severity,
      source: "nvd",
      cvss,
      vendor,
      country: geo.country,
      countryCode: geo.countryCode,
      lat: geo.lat,
      lng: geo.lng,
      publishedAt: item.cve.published,
      updatedAt: item.cve.lastModified,
      url: `https://nvd.nist.gov/vuln/detail/${item.cve.id}`,
      tags,
    });
  }

  return threats;
}