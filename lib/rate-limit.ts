import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Best-effort caller identifier for a serverless function behind a proxy —
// there's no raw socket to read a "real" IP from, only what upstream
// proxies choose to forward. Good enough for abuse throttling (a
// determined attacker can rotate IPs), not meant as a strong identity.
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Backed by the rate_limits table (database/25_rate_limits.sql) rather than
// in-memory, since this runs as serverless functions with no shared memory
// across invocations. Fails OPEN (allows the request) if the check itself
// errors, so a database hiccup can't take down registration/queries.
export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("Rate limit check failed, allowing request:", error);
      return true;
    }
    return data === true;
  } catch (e) {
    console.error("Rate limit check threw, allowing request:", e);
    return true;
  }
}
