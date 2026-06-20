# EvilsEye

Pandora's Global Threat Visualizer — an interactive CVE threat globe for bug bounty hunters and OSINT analysts.

## Features

- **3D threat globe** with severity-colored markers (CISA KEV + NVD)
- **Live threat feed** with search, severity, and source filters
- **CVE detail panel** with CVSS, vendor, required actions, and NVD links
- **Discord webhook alerts** when new threats are detected
- **Auto-sync** every 5 minutes (client) + cron every 10 minutes (deployed)

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your Discord webhook URL to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Discord Webhook Setup

1. In Discord: **Server Settings → Integrations → Webhooks → New Webhook**
2. Copy the webhook URL
3. Add to `.env.local`:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

4. Restart the dev server
5. Click the gear icon → **Send Test Notification**

New CISA KEV entries and High/Critical NVD CVEs trigger Discord embeds automatically. Deduplication prevents repeat alerts for the same CVE.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WEBHOOK_URL` | For alerts | Discord incoming webhook URL |
| `NVD_API_KEY` | No | NIST NVD API key (higher rate limits) |
| `CRON_SECRET` | No | Bearer token for `/api/cron/sync` and `/api/sync` |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/threats` | GET | Fetch threats (no Discord notify) |
| `/api/sync` | POST | Sync feeds + send Discord alerts for new threats |
| `/api/cron/sync` | GET | Cron endpoint (Vercel, every 10 min) |
| `/api/webhooks/test` | POST | Send a test Discord notification |

## Deploy (Vercel)

```bash
vercel
```

Set `DISCORD_WEBHOOK_URL` in Vercel environment variables. The included `vercel.json` runs `/api/cron/sync` every 10 minutes.

## Data Sources

- [CISA Known Exploited Vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [NIST NVD CVE API](https://nvd.nist.gov/developers/vulnerabilities)

## License

Open source — built for the bug bounty and threat intel community.