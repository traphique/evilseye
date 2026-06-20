import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/discord";

export async function POST() {
  const result = await sendTestNotification();

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, sent: result.sent });
}