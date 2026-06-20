import { NextResponse } from "next/server";
import { syncThreats } from "@/lib/threats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await syncThreats({ notify: false, markSeen: false });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch threats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}