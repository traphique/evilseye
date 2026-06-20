import { promises as fs } from "fs";
import os from "os";
import path from "path";

function getSeenFilePath() {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "evilseye-seen-threats.json");
  }
  return path.join(process.cwd(), ".data", "seen-threats.json");
}

async function ensureDataDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function loadSeenThreatIds(): Promise<Set<string>> {
  const seenFile = getSeenFilePath();
  try {
    const raw = await fs.readFile(seenFile, "utf-8");
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export async function saveSeenThreatIds(ids: Set<string>): Promise<void> {
  const seenFile = getSeenFilePath();
  await ensureDataDir(seenFile);
  const list = [...ids].slice(-5000);
  await fs.writeFile(seenFile, JSON.stringify(list, null, 2), "utf-8");
}

export async function markThreatsSeen(ids: string[]): Promise<void> {
  const seen = await loadSeenThreatIds();
  for (const id of ids) seen.add(id);
  await saveSeenThreatIds(seen);
}