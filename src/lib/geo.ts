const VENDOR_GEO: Record<string, { country: string; code: string; lat: number; lng: number }> = {
  microsoft: { country: "United States", code: "US", lat: 47.6, lng: -122.3 },
  apple: { country: "United States", code: "US", lat: 37.3, lng: -122.0 },
  google: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  cisco: { country: "United States", code: "US", lat: 37.4, lng: -121.9 },
  oracle: { country: "United States", code: "US", lat: 37.5, lng: -122.3 },
  adobe: { country: "United States", code: "US", lat: 37.3, lng: -121.9 },
  vmware: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  fortinet: { country: "United States", code: "US", lat: 37.4, lng: -121.9 },
  paloalto: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  juniper: { country: "United States", code: "US", lat: 37.4, lng: -122.0 },
  ibm: { country: "United States", code: "US", lat: 41.0, lng: -73.8 },
  sap: { country: "Germany", code: "DE", lat: 49.3, lng: 8.6 },
  siemens: { country: "Germany", code: "DE", lat: 48.1, lng: 11.6 },
  schneider: { country: "France", code: "FR", lat: 48.8, lng: 2.3 },
  huawei: { country: "China", code: "CN", lat: 22.5, lng: 114.1 },
  zte: { country: "China", code: "CN", lat: 22.5, lng: 113.9 },
  samsung: { country: "South Korea", code: "KR", lat: 37.5, lng: 127.0 },
  lenovo: { country: "China", code: "CN", lat: 39.9, lng: 116.4 },
  dell: { country: "United States", code: "US", lat: 32.8, lng: -96.8 },
  hp: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  hewlett: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  citrix: { country: "United States", code: "US", lat: 37.4, lng: -121.9 },
  atlassian: { country: "Australia", code: "AU", lat: -33.9, lng: 151.2 },
  jetbrains: { country: "Czech Republic", code: "CZ", lat: 50.1, lng: 14.4 },
  mozilla: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  linux: { country: "Global", code: "GL", lat: 20.0, lng: 0.0 },
  apache: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  nginx: { country: "Russia", code: "RU", lat: 55.8, lng: 37.6 },
  wordpress: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
  openssl: { country: "United States", code: "US", lat: 37.4, lng: -122.1 },
};

const DEFAULT_GEO = { country: "Global", code: "GL", lat: 15.0, lng: 25.0 };

function hashOffset(input: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const lat = ((hash % 50) - 25) * 0.6;
  const lng = (((hash >> 8) % 70) - 35) * 0.8;
  return { lat, lng };
}

export function resolveGeo(vendor?: string, cveId?: string) {
  const key = vendor?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const base = VENDOR_GEO[key] ?? DEFAULT_GEO;
  const offset = hashOffset(cveId ?? vendor ?? "global");

  return {
    country: base.country,
    countryCode: base.code,
    lat: base.lat + offset.lat,
    lng: base.lng + offset.lng,
  };
}