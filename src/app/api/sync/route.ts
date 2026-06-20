import { NextRequest, NextResponse } from "next/server";
import { syncThreats } from "@/lib/threats";
import type { AlertSettings, ThreatSeverity } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseAlertSettings(body: Record<string, unknown> | null): AlertSettings | undefined {
  if (!body) return undefined;

  const minSeverity = body.minSeverity as ThreatSeverity | undefined;
  return {
    minSeverity: minSeverity ?? "high",
    notifyKev: body.notifyKev !== false,
    notifyNvd: body.notifyNvd !== false,
    keywords: Array.isArray(body.keywords)
      ? body.keywords.filter((k): k is string => typeof k === "string")
      : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> | null = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const result = await syncThreats({
      notify: true,
      alertSettings: parseAlertSettings(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}