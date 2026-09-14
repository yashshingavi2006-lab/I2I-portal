-- ============================================================================
-- RATE LIMITING for public, unauthenticated endpoints (/api/register,
-- /api/raise-query). Backed by a table (not in-memory) since the app runs
-- as serverless functions — each invocation can land on a different
-- instance with its own fresh memory, so an in-memory counter would never
-- actually limit anything in production.
--
-- check_rate_limit() is a single atomic UPSERT: it either starts a new
-- window for a key or increments the existing one, and returns whether the
-- request is still within the allowed count for that window. Deliberately
-- not perfectly linearizable under extreme concurrency (a tiny race is
-- possible between the window-reset check and the increment), but that's
-- an acceptable trade-off for abuse throttling, not billing.
-- ============================================================================

create table rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

alter table rate_limits enable row level security;
-- No policies: nobody gets client-side access at all. Every call site uses
-- the service-role admin client (these are server-only routes), which
-- bypasses RLS regardless — this just closes the door if that ever changes.

create or replace function check_rate_limit(p_key text, p_max_count int, p_window_seconds int)
returns boolean as $$
declare
  v_count int;
begin
  insert into rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then 1
        else rate_limits.count + 1
    end,
    window_start = case
      when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then now()
        else rate_limits.window_start
    end
  returning count into v_count;

  return v_count <= p_max_count;
end;
$$ language plpgsql security definer;
