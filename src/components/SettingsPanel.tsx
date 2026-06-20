"use client";

import { useState } from "react";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  discordConfigured: boolean;
}

export function SettingsPanel({ open, onClose, discordConfigured }: SettingsPanelProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!open) return null;

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhooks/test", { method: "POST" });
      const data = await res.json();
      setTestResult(
        data.ok
          ? "Test notification sent to Discord!"
          : data.error ?? "Failed to send test notification",
      );
    } catch {
      setTestResult("Failed to reach webhook endpoint");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c111a] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Alert Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${discordConfigured ? "bg-emerald-400" : "bg-red-400"}`}
              />
              <p className="text-sm font-medium text-zinc-200">Discord Webhook</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              {discordConfigured
                ? "Webhook configured via DISCORD_WEBHOOK_URL. New threats trigger push notifications automatically."
                : "Set DISCORD_WEBHOOK_URL in your .env.local file to enable alerts."}
            </p>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testing || !discordConfigured}
              className="mt-3 rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {testing ? "Sending…" : "Send Test Notification"}
            </button>
            {testResult && (
              <p
                className={`mt-2 text-xs ${testResult.includes("sent") ? "text-emerald-400" : "text-red-400"}`}
              >
                {testResult}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-medium text-zinc-200">Alert Rules</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              <li>• CISA KEV entries always alert (actively exploited)</li>
              <li>• NVD CVEs with High or Critical severity</li>
              <li>• Deduplication prevents repeat notifications</li>
              <li>• Auto-sync every 5 minutes in the app</li>
              <li>• Cron sync every 10 minutes when deployed</li>
            </ul>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-xs text-cyan-300/90">
              <strong>Setup:</strong> Copy <code className="text-cyan-200">.env.example</code> to{" "}
              <code className="text-cyan-200">.env.local</code> and paste your Discord webhook URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}