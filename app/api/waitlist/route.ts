import { NextRequest } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

const STORE = join(process.cwd(), ".data", "waitlist.jsonl");

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string" || !isEmail(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const entry = {
      ts: new Date().toISOString(),
      email: email.toLowerCase().trim(),
      source: typeof source === "string" ? source : "unknown",
      ip:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "",
      ua: req.headers.get("user-agent") || "",
    };

    // Persist append-only — survives Vercel cold starts (ephemeral but fine for now;
    // wire Resend / Supabase later via .env)
    try {
      await mkdir(join(process.cwd(), ".data"), { recursive: true });
      await appendFile(STORE, JSON.stringify(entry) + "\n", "utf8");
    } catch {
      // Vercel filesystem is read-only at runtime; logging is fallback
      console.log("[waitlist]", JSON.stringify(entry));
    }

    // TODO: forward to Resend / Notion / Supabase when keys are set
    return Response.json({
      ok: true,
      message: "You're on the list. We'll be in touch.",
    });
  } catch (e) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({ error: "POST only" }, { status: 405 });
}
