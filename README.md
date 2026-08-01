# I2I Portal — Phase 1

Registration portal for Ignited Innovators of India (Bhau Institute, COEP).

## What's built so far

- **Database** (`database/*.sql`) — teams, members, sectors, auto project-code
  generation, role-based access via Postgres Row-Level Security
- **Registration wizard** (`/register`) — the 4-page flow you specified
- **Auth** — team leader invite-by-email -> set password (`/set-password`),
  login (`/login`), forgot password (`/forgot-password`, `/reset-password`)
- **Dashboard stub** (`/dashboard`) — shows only the teams a logged-in user is
  allowed to see, enforced by the database, not just the UI

Phase 2 (funding/bank details) and Phase 3 (mentor/ambassador assignment) UI
is not built yet — the database tables for them already exist
(`phase2_applications`, `phase2_bill_items`, `project_assignments`), so we can
build those screens next without changing the schema.

## Setup

### 1. Create a Supabase project
Go to supabase.com -> New Project (free tier is fine to start).

### 2. Run the database scripts
In the Supabase dashboard -> SQL Editor, run these **in order**:
1. `database/01_schema.sql`
2. `database/02_functions.sql`
3. `database/03_rls_policies.sql`
4. `database/04_seed_sectors.sql`

### 3. Set environment variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
  dashboard -> Settings -> API
- `SUPABASE_SERVICE_ROLE_KEY` — same page, the `service_role` secret key
  (never expose this in the browser or commit it to git)
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

### 4. Configure Supabase Auth email
Supabase -> Authentication -> Email Templates: customize the "Invite user" and
"Reset password" templates if you want I2I branding in the emails
participants receive. By default Supabase sends via its own limited email
service (fine for testing, ~a few emails/hour) — for real registration
volume (800 participants) you'll want to connect a custom SMTP provider
(Resend is a good free-tier fit) under Authentication -> SMTP Settings.

### 5. Install and run
```bash
npm install
npm run dev
```
Visit http://localhost:3000

### 6. Deploy
Push to GitHub, import into Vercel, add the same environment variables there,
deploy. Set `NEXT_PUBLIC_SITE_URL` to your real domain once deployed.

## Creating your first Secretary account

Registrations create rows in `teams`, but staff accounts (Secretary, Chief
Ambassadors, Ambassadors, Mentors) need to be created manually the first
time. In Supabase -> Authentication -> Users, create a user for yourself, then
in SQL Editor run:

```sql
insert into staff_profiles (id, full_name, email, role)
values ('<the-auth-user-id-you-just-created>', 'Your Name', 'you@example.com', 'secretary');
```

After that, the Secretary can be given a proper admin UI to create the rest
of the team's accounts — that's a good next screen to build.

## Sectors (confirmed 2026-27)

| Prefix | Sector |
|---|---|
| HHH | 3H — Health, Hunger & Humanity |
| AGR | Agriculture |
| EDU | Education |
| INN | Innovation & Technology |
| ENV | Environment |
| ENT | Entrepreneurship / Skill Development |

Note: "Agriculture" wasn't in your original 5-prefix list, so it's been
given `AGR`. The "3H" sector keeps the `HHH` prefix (already locked into the
project-code format) — "3H" is just its display name.

## Notification system (added)

Database order is now:
1. `01_schema.sql`
2. `02_functions.sql`
3. `03_rls_policies.sql`
4. `04_seed_sectors.sql`
5. `05_notifications.sql`
6. `06_phase3_automation.sql`
7. `07_phase2_automation.sql`

How it works: DB triggers (Phase 3 assignment, Phase 2 funding status,
Phase 2 shortlist) only *enqueue* a row in `notification_queue`. A separate
worker at `/api/notifications/process` reads pending rows and actually sends
them — this keeps email/WhatsApp providers swappable without touching any
trigger logic.

### New environment variables
```
EMAIL_PROVIDER=resend        # or "smtp" for Google Workspace/Gmail
RESEND_API_KEY=...           # if using Resend
SMTP_USER=...                # if using smtp
SMTP_APP_PASSWORD=...        # Google "App Password", not your login password
NOTIFICATION_FROM_EMAIL=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
CRON_SECRET=...              # any random string — protects the /process endpoint
```

### Free scheduling via GitHub Actions
`.github/workflows/keep-alive.yml` runs every 15 minutes, for free, on any
GitHub repo. It does two things: pings `/api/health` (stops Supabase Free
tier from auto-pausing after 7 days idle) and calls
`/api/notifications/process` (sends queued emails/WhatsApp messages).

To enable it: push this repo to GitHub, then under Settings → Secrets and
variables → Actions, add:
- `SITE_URL` — your deployed URL (e.g. `https://i2i-coep.vercel.app`)
- `CRON_SECRET` — same value as the env var above

No paid cron service needed.

## Three portals

Login is unified at `/login`, but every user is auto-routed to the right
portal based on their account:

- **`/portal/secretary`** — master access, Secretary only
- **`/portal/student`** — team leaders, scoped to their own registration
- **`/portal/ambassador`** — Chief Ambassadors, Ambassadors, Mentors, and
  Heads for now (split into separate portals later if their content diverges
  enough to need it)

`/dashboard` is just a router — it detects the logged-in user's role and
immediately redirects to the correct portal above. Each portal page also
independently checks the user belongs there (not just relying on the
router), so directly visiting the wrong URL bounces you back.

**Current state: all 3 are functional skeletons** — real auth, real guards,
real data (Secretary sees totals across all teams, students see their own
team, ambassadors see their assigned teams via RLS) — but the actual content
Yash wants on each screen is still pending his spec.

## Login: remember me + browser password save

`/login` is a single shared page for all 3 portals (the portal cards on the
homepage just add `?portal=secretary` etc. to pre-label the page — the
actual role check still happens server-side after auth, so this label is
cosmetic only, not a security boundary).

- **Save credentials (browser password manager):** the login form is a real
  `<form>` with `autoComplete="username"` / `autoComplete="current-password"`
  — this is what makes Chrome/Safari/etc. offer to save the password. No
  extra code needed beyond using proper form semantics, which is now in place.
- **Remember me (session persistence):** a checkbox on the login form.
  Checked (default) -> session persists across browser restarts
  (`localStorage`). Unchecked -> session clears when the browser/tab closes
  (`sessionStorage`). Implemented in `lib/supabase/client.ts`.

## Landing page: dark "Ember" theme

The homepage (`/`) uses a separate dark theme, scoped via the `.theme-ember`
class (see `app/globals.css`) — it does NOT affect the registration wizard,
dashboards, or auth pages, which stay on the light "paper" theme for
readability while filling out forms.

- `components/landing/hero.tsx` — staggered headline reveal, ambient glow,
  animated CTA
- `components/landing/ember-field.tsx` — floating ember particles (client-only,
  randomized after mount to avoid SSR hydration mismatches)
- `components/landing/stat-counter.tsx` — count-up numbers that trigger when
  scrolled into view
- `components/landing/portal-section.tsx` — the 3 portal cards + sector strip,
  with scroll-reveal and hover glow

Built with Framer Motion (lightweight, plays well with Next.js/React Server
Components — only the interactive pieces are client components).

Next up for the visual pass, once you're happy with the landing page:
registration wizard step transitions + a proper project-code reveal moment.

## Four portals (updated)

- **`/portal/secretary`** — master access, Secretary only
- **`/portal/participant`** — team leaders (renamed from "student")
- **`/portal/ambassador`** — Chief Ambassadors, Ambassadors, and Heads
- **`/portal/mentor`** — Mentors (Eaton mentors), now fully separate from Ambassadors

`staff_profiles.role = 'mentor'` routes here specifically; `chief_ambassador`,
`ambassador`, and `head` route to the Ambassador portal. Split Ambassador
further later if Chief Ambassador/Head content ends up diverging enough.

## Dark theme now applied to auth + all 4 portals

The dark "Ember" theme (previously landing-page-only) now also covers:
login, forgot-password, reset-password, set-password, and all 4 portal
dashboards (secretary/participant/ambassador/mentor).

How: `.theme-ember` in `app/globals.css` overrides the SAME variable names
used everywhere (`--paper`, `--ink`, `--surface`, `--line`, `--muted`) rather
than introducing separate dark-mode props on each component. Any component
using `bg-paper` / `bg-surface` / `text-ink` / `border-line` / `text-muted`
automatically goes dark the moment it's nested inside an element with
`className="theme-ember"` — no per-component rewrites needed if you add more
pages later, just wrap them the same way.

**Still on the light theme (intentionally):** the registration wizard
(`/register`) — kept light for readability, since it's the public form 800
people fill out on their phones. Say the word if you want that dark too.

## Dark theme + motion, now everywhere (including registration)

Per your request, the same dark "Ember" theme and motion language from the
landing page now covers the ENTIRE app — including `/register`, which was
previously kept light.

- `components/page-shell.tsx` — shared wrapper (dark theme + entrance fade +
  optional ember particles). Used by every page except the landing page
  (which has its own richer hero treatment).
- `components/animated-card.tsx` / `animated-stat-card.tsx` /
  `assigned-projects-list.tsx` — reusable animated pieces for portal
  dashboards (fade-in cards, count-up stats, staggered list reveals)
- Registration wizard: steps now slide/fade between each other
  (`AnimatePresence` in `registration-wizard.tsx`), and the final
  project-code reveal has a proper staged entrance (checkmark springs in,
  then text reveals line by line)

If any specific screen still feels visually inconsistent once you're
clicking through it for real, point to exactly which one and I'll adjust —
theming is now centralized so most fixes are small.

## Premium micro-interactions + scroll storytelling (landing page)

- `components/spotlight-card.tsx` — cursor-following glow, applied to the
  portal cards
- `components/magnetic-button.tsx` — subtle cursor-pull on the hero's
  "Register your project" CTA
- `components/landing/countdown.tsx` — live countdown to the registration
  deadline. **`lib/constants.ts` -> `REGISTRATION_DEADLINE` is a placeholder
  date — update it to the real one.**
- `components/landing/reach-network.tsx` — abstract animated network
  visualization (not a literal geographic map — I didn't have a reliable way
  to source an accurate India SVG through my tools, and a rough hand-drawn
  outline would look wrong). **`NODES` array is sample data — replace with
  real participating colleges + rough positions once you have the list.**

Not built yet: past winners showcase — waiting on real photos/data from you
rather than fabricating placeholder "winners."

## Remaining UI categories — now done

- **Ignition cursor trail** (`components/landing/cursor-trail.tsx`) — small
  embers spawn and fade as the cursor moves, landing page only
- **Phase journey line** (`components/landing/phase-journey.tsx`) — the 4
  phases shown as connected nodes with a line that draws in on scroll
- **Film grain overlay** — subtle noise texture applied globally
  (`.grain-overlay` in `globals.css`, mounted once in `app/layout.tsx`) —
  very low opacity (0.04), makes dark sections feel designed rather than
  just "inverted colors"
- **Page transitions** (`components/page-transition.tsx`) — fade+slide
  between every route navigation, wired into the root layout
- **Branded loader** (`app/loading.tsx`) — Next.js shows this automatically
  during any route's async data loading (e.g. navigating into a portal while
  its Supabase query resolves) instead of a blank flash

All 4 of the original UI upgrade categories (signature motifs, premium
micro-interactions, scroll storytelling, finishing touches) are now built.

## Bug fix: "Unexpected end of JSON input" on registration submit

**Root cause found and fixed:** if `.env.local` is missing real Supabase
credentials, the server crashed with an empty response body when submitting
the registration form, which broke the client's `res.json()` call with that
exact cryptic error.

**Fixed in two places** (defense in depth):
- `app/api/register/route.ts` — the whole handler is now wrapped in
  try/catch, so any unexpected failure (missing env vars, DB unreachable,
  etc.) always returns a proper JSON error instead of crashing
- `components/registration-wizard.tsx` — the client now safely handles a
  non-JSON/empty response too, showing a clear message instead of the raw
  parse error

**Verified:** reproduced the exact bug in a local test (empty Supabase env
vars → confirmed crash with `Error: supabaseUrl is required` → empty
response body → "Unexpected end of JSON input" on the client), then
confirmed the fix returns a clean error message instead:
`{"error":"Server is not configured yet (missing Supabase credentials).
Contact the site admin."}`

**Still needed to fully verify the success path (project code generation):**
a real Supabase project. I can't reach supabase.co from my own environment
(network restricted to package registries), so I could only confirm the
form → API → validation logic works correctly, not the actual database
write + project-code trigger. Once you have real credentials in
`.env.local`, that's the next thing worth testing end-to-end.

## Extended schema (from reference portal screenshots)

Two new files, run after `07_phase2_automation.sql`:
1. `database/08_extended_schema.sql`
2. `database/09_extended_rls.sql`

New tables: `meetings` (ambassador raises questions, mentor grades, score
auto-calculated), `milestones`, `timeline_entries` (daily progress log),
`discussion_messages` (team/mentor/ambassador chat), `edit_requests`,
`phase4_submissions` (report/PPT/video/jury score/award), `audit_logs`,
`email_templates` (admin-editable), `phase_settings` (phase open/close
control).

New columns: `team_members.role`, `teams.department/district/division`,
`teams.timeline_target_meetings/timeline_locked`,
`phase2_applications.screening_status` (the Pass/Reject "fast screening"
step, separate from the later funding approval decision).

New function: `make_all_phase1_eligible()` — the bulk action from the admin
Phase 1 queue. Reuses the existing `shortlisted_phase2` status, so it also
triggers the existing auto-notification logic for free.

**Not yet built:** the actual portal pages that use these tables — the
Secretary dashboard's 4 phase queues + management screens, the Participant's
Workspace/Team Info tabs, and the Mentor/Ambassador's discussion board +
joint evaluation flow. That's the next chunk of work.

## Mentor + Ambassador portals — real functionality

Both now use `components/portfolio-workspace.tsx`, a shared component that
adapts by `role` prop rather than being duplicated:

- **Assigned portfolios sidebar** — click to switch between your projects
- **Project header** — status, college, leader phone, pitch deck link;
  approved funding shown only to Ambassadors (matches the reference —
  Mentors don't see funding amounts)
- **Milestone checklist** — reads from the `milestones` table, shows the
  "No development milestones created yet" empty state until you build the
  admin/mentor UI to actually create them
- **Ambassador: "Raise Joint Meet Evaluation"** — pick meeting type/date,
  write evaluation questions, submit — inserts into `meetings` with
  `status: 'awaiting_grading'`
- **Mentor: grading modal** — a slider per question (0-10), live-calculated
  average, optional comment, saves to `meetings` — the database trigger
  (`calculate_mentor_score` in `08_extended_schema.sql`) recalculates
  `mentor_score` server-side too, so the average is never just
  client-trusted
- **Project Discussion Board** — real shared chat, both roles read/write to
  `discussion_messages`, scoped by RLS to only people assigned to that team

This talks directly to Supabase from the browser (not through API routes) —
safe here because RLS is doing the actual access enforcement, not the UI
layer. Uses `database/08_extended_schema.sql` + `09_extended_rls.sql`, so
make sure those are run.

**Not built yet in this pass:** the milestone *creation* UI (currently
read-only display), and marking milestones as done. Small addition whenever
you want it — say so and I'll wire it in.
