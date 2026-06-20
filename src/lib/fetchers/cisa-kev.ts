import { resolveGeo } from "../geo";
import type { ThreatEvent } from "../types";

interface KevEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
  cwes?: string[];
}

interface KevFeed {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: KevEntry[];
}

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

export async function fetchCisaKev(): Promise<ThreatEvent[]> {
  const res = await fetch(KEV_URL, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`CISA KEV fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as KevFeed;
  const recent = [...data.vulnerabilities]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 80);

  return recent.map((entry) => {
    const geo = resolveGeo(entry.vendorProject, entry.cveID);
    const tags = ["KEV", "Exploited"];
    if (entry.knownRansomwareCampaignUse === "Known") tags.push("Ransomware");

    return {
      id: `kev-${entry.cveID}`,
      cveId: entry.cveID,
      title: entry.vulnerabilityName,
      description: entry.shortDescription,
      severity: "critical" as const,
      source: "cisa-kev" as const,
      cvss: 9.8,
      vendor: entry.vendorProject,
      product: entry.product,
      country: geo.country,
      countryCode: geo.countryCode,
      lat: geo.lat,
      lng: geo.lng,
      requiredAction: entry.requiredAction,
      publishedAt: entry.dateAdded,
      updatedAt: entry.dateAdded,
      url: `https://nvd.nist.gov/vuln/detail/${entry.cveID}`,
      tags,
    } satisfies ThreatEvent;
  });
}