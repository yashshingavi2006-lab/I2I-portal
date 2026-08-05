import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components ("use client").
// rememberMe=true (default) -> session persists across browser restarts (localStorage)
// rememberMe=false -> session is cleared when the browser/tab is closed (sessionStorage)
export function createClient(rememberMe: boolean = true) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: typeof window !== "undefined"
          ? (rememberMe ? window.localStorage : window.sessionStorage)
          : undefined,
        persistSession: true,
      },
    }
  );
}
