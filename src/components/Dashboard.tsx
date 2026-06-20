"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Globe } from "./Globe";
import { ThreatFeed } from "./ThreatFeed";
import { StatsBar } from "./StatsBar";
import { FilterBar } from "./FilterBar";
import { ThreatDetail } from "./ThreatDetail";
import { SettingsPanel } from "./SettingsPanel";
import { useFilteredThreats, useThreatStore } from "@/stores/threat-store";

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

interface DashboardProps {
  discordConfigured: boolean;
}

export function Dashboard({ discordConfigured }: DashboardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastNotifyCount, setLastNotifyCount] = useState<number | null>(null);

  const {
    loading,
    syncing,
    error,
    stats,
    lastSync,
    selectedId,
    search,
    severityFilter,
    sourceFilter,
    setSearch,
    setSeverityFilter,
    setSourceFilter,
    selectThreat,
    fetchThreats,
    syncAndNotify,
    threats,
  } = useThreatStore();

  const filtered = useFilteredThreats();
  const selected = threats.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    fetchThreats();
    syncAndNotify().then((result) => {
      if (result && result.notified > 0) {
        setLastNotifyCount(result.notified);
      }
    });

    const interval = setInterval(async () => {
      const result = await syncAndNotify();
      if (result && result.notified > 0) {
        setLastNotifyCount(result.notified);
      }
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchThreats, syncAndNotify]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#060a10]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 ring-1 ring-cyan-500/30">
              <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-100">EvilsEye</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Global Threat Visualizer
              </p>
            </div>
          </div>
          <StatsBar stats={stats} />
        </div>

        <div className="flex items-center gap-3">
          {lastNotifyCount != null && lastNotifyCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400 ring-1 ring-emerald-500/30">
              {lastNotifyCount} new alert{lastNotifyCount > 1 ? "s" : ""} sent
            </span>
          )}
          {lastSync && (
            <span className="hidden text-xs text-zinc-500 sm:inline">
              Updated {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
            </span>
          )}
          <button
            type="button"
            onClick={() => syncAndNotify()}
            disabled={syncing}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
            aria-label="Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {error && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[300px] flex-1 lg:min-h-0">
          <Globe
            threats={filtered}
            selectedId={selectedId}
            onSelect={selectThreat}
          />
          <ThreatDetail threat={selected} onClose={() => selectThreat(null)} />
        </div>

        <aside className="flex w-full flex-col border-t border-white/8 lg:w-[400px] lg:border-l lg:border-t-0 xl:w-[440px]">
          <FilterBar
            search={search}
            severityFilter={severityFilter}
            sourceFilter={sourceFilter}
            onSearchChange={setSearch}
            onSeverityChange={setSeverityFilter}
            onSourceChange={setSourceFilter}
          />
          <div className="min-h-0 flex-1">
            <ThreatFeed
              threats={filtered}
              selectedId={selectedId}
              loading={loading}
              onSelect={selectThreat}
            />
          </div>
        </aside>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        discordConfigured={discordConfigured}
      />
    </div>
  );
}