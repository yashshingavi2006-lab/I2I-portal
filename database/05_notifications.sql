-- ============================================================================
-- NOTIFICATION QUEUE
-- The database only ENQUEUES notifications (via triggers below). A separate
-- worker (Next.js API route, see app/api/notifications/process/route.ts)
-- picks up pending rows and actually sends them via email/WhatsApp. This
-- keeps the provider (Resend vs Workspace SMTP, MSG91 vs WhatsApp Cloud API)
-- completely swappable without touching any trigger logic.
-- ============================================================================

create type notification_channel as enum ('email', 'whatsapp');

create type notification_type as enum (
  'leader_invite',           -- Phase 1: set-password invite
  'phase2_shortlisted',      -- team moved to Phase 2
  'mentor_assigned',         -- Phase 3: notify the mentor
  'ambassador_assigned',     -- Phase 3: notify the ambassador
  'team_notified_of_mentor', -- Phase 3: notify the team leader who their mentor/ambassador is
  'funding_status_update',   -- Phase 2: approved/rejected/partial
  'phase4_update'            -- reserved for later
);

create table notification_queue (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null,
  channel notification_channel not null,
  recipient_email text,
  recipient_phone text,
  team_id uuid references teams(id) on delete cascade,
  staff_id uuid references staff_profiles(id) on delete cascade,
  payload jsonb not null default '{}',   -- template variables: project_code, team_name, etc.
  status text not null default 'pending'
    check (status in ('pending','sent','failed')),
  attempts int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index idx_notification_queue_status on notification_queue(status, created_at);

alter table notification_queue enable row level security;

-- Only the Secretary (or the backend service role, which bypasses RLS
-- entirely) should ever read/write this table directly.
create policy notification_queue_secretary on notification_queue
  for all using (is_secretary());
