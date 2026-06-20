import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const discordConfigured = Boolean(process.env.DISCORD_WEBHOOK_URL);

  return <Dashboard discordConfigured={discordConfigured} />;
}