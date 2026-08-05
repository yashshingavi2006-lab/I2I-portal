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

## Secretary portal — now fully built (all 4 phases + management)

Restructured into real sub-routes under `/portal/secretary/`, each with real
data and real actions:

- **Overview** (`/portal/secretary`) — live stats (total/pending/eligible,
  selection rate), sector breakdown bar chart, competition-gate distribution,
  recent audit activity
- **Phase 1** (`/phase-1`) — registration queue, tabs, search, and the
  **"Make All Phase 1 Eligible" bulk action** wired to the
  `make_all_phase1_eligible()` SQL function
- **Phase 2** (`/phase-2`) — proposal queue with **Pass/Reject fast
  screening** buttons (writes to `phase2_applications.screening_status`)
- **Phase 3** (`/phase-3`) — all joint meeting evaluations across every team,
  ambassador vs mentor scores, status
- **Phase 4** (`/phase-4`) — jury score entry + result award assignment
  (Not Scored / Under Evaluation / Completed / Winner), upserts to
  `phase4_submissions`
- **Edit Requests** (`/edit-requests`) — approve/reject participant requests

All secretary actions talk to Supabase directly from the browser (RLS
enforces access, same pattern as Mentor/Ambassador).

## Participant portal — Phase 2 submission + Phase 3 timeline now real

`components/participant/workspace-tab.tsx` rebuilt:
- **Phase 2 view** (shown once shortlisted): 4-gate live tracker (PPT
  Screening / Bank Verification / Funding Allotment / Jury & Mentors,
  computed from real data), plus 3 sub-tabs — pitch deck **link** submission
  (not file upload, per the reference), itemized budget/bills, bank details
- **Phase 3 view** (shown once past Phase 2): approved funding, assigned
  mentor/ambassador names, and a daily timeline log participants can add to
  and edit (locks when `teams.timeline_locked` is true)

## Not yet built
- Phase 4 participant-facing submission (report/PPT/video links) — the
  Secretary side can already receive and score these, participant upload UI
  still needed
- Milestone *creation* (still read-only display everywhere)
- Users & Access management screen (Secretary assigning roles/permissions) —
  currently has to be done via direct SQL per the setup steps earlier in
  this README

## Secretary portal — the remaining big gaps, now closed

- **Phase 2 → Review modal**: click "🎓 Review" on any proposal to see its
  full bill breakdown, bank details, and set a real funding decision
  (Under Review / Approved / Partial / Rejected + approved amount) —
  previously only the fast-screening Pass/Reject existed
- **Phase 3 → Assign Mentor & Ambassador**: the actual admin UI for the
  assignment system that was backend-only until now. Pick a team, pick a
  mentor, pick an ambassador, click Assign — the database trigger enforces
  the 1-3 project cap and rejects (with a visible error) if you try to
  over-assign someone. Only shows teams whose funding is approved/partial
  and don't yet have both roles filled.
- **Users & Access** (`/portal/secretary/users`) — the Secretary can now
  invite Chief Ambassadors, Ambassadors, Mentors, and Heads directly from
  the UI instead of doing it via raw SQL. New API route
  `app/api/staff/invite/route.ts` uses the same invite-by-email pattern as
  participant registration — the invited person gets an email to set their
  password, and a `staff_profiles` row is created automatically with the
  right role.
- **Audit logging** now actually fires on real actions (screening
  decisions, funding decisions, assignments, staff invites) — the Overview
  dashboard's "Recent Audit Activity" feed will show real activity instead
  of staying empty.

Still not built: Phase Engine (phase open/close scheduling — table exists,
no UI), Email Templates admin editor (table exists, no UI), participant
Phase 4 submission UI. All lower priority than what's now working.

## Participant portal — Phase 4 submission now built

Once a team reaches `funded` or `completed` status, a new panel appears
below the Phase 3 timeline: submit final report / presentation / demo video
as links, then see the jury's result (Not Scored / Under Evaluation /
Completed / 🏆 Winner) and score once the Secretary grades it from their
Phase 4 screen.

## Mentor + Ambassador portal — milestones now interactive

The Structured Milestone Checklist was read-only until now. Both roles can:
- **Add a milestone** — types a title, hits Enter or clicks Add
- **Toggle it done** — click the checkbox, updates immediately and syncs to
  the database (`is_done` + `completed_at`)

Both Mentor and Ambassador share management rights on a team's milestones
(either can add/check them off) since they're expected to collaborate.

## Phase 2 — real file uploads, congratulations screen, secretary export

**New setup step:** run `database/13_phase2_uploads.sql` (after `12_...sql`),
then `npm install` (adds `exceljs` for the spreadsheet export). This
migration adds 3 columns to `phase2_applications` and creates a **private**
Supabase Storage bucket, `phase2-uploads`, with RLS scoped by team.

**Participant side** (`components/participant/workspace-tab.tsx` →
`Phase2Panel`):
- A congratulations banner appears the moment a team is shortlisted into
  Phase 2, with a **"Download Phase 2 Proposal Format"** button —
  `public/templates/I2I-Phase2-Pitch-Format.docx`, a branded fill-in
  template (problem statement, solution, impact, milestone plan, itemized
  budget table, sustainability plan, team details, declaration).
- The "Pitch & Documents" tab now has a real **file upload** for the pitch
  deck (`.pdf`/`.pptx`, 25MB) instead of a pasted link, plus optional
  uploads for a pitch/prototype video (`.mp4`, 100MB), a research paper
  (`.pdf`, 20MB), and up to 6 free-form "other documents"
  (`.pdf/.doc/.docx/.jpg/.png`, 20MB each) — plus a brief written summary
  and the total amount requested.
- The Bank Details tab now also collects a **passbook photo** (required)
  and **PAN photo** (optional) upload, alongside the existing account
  fields — used only for fund disbursal, never for any transaction.
- Every upload goes through `components/participant/file-upload-field.tsx`
  (single file) or `other-documents-field.tsx` (multiple): extension +
  size are validated client-side *before* the request is sent, every
  Storage call is wrapped in try/catch with a plain-language error message,
  and a failed upload never breaks the rest of the form — this matters at
  the scale of hundreds of concurrent participants, where letting one bad
  upload cascade into a broken page isn't an option.

**Secretary side** (`components/secretary/phase2-queue.tsx`): a
**"⬇ Download Spreadsheet"** button calls the new
`app/api/secretary/phase2-export/route.ts` (Secretary-only, checked
server-side) which builds a multi-sheet `.xlsx` with `exceljs` — a
**Summary** sheet with per-sector counts, then **one sheet per sector**
with every application's details, funding numbers, and a signed link
(14-day expiry) to every uploaded file. File links are batch-signed in a
single Storage call per export rather than one call per file, and a
signing hiccup degrades to "Link unavailable" for that file instead of
failing the whole export.

**On the 1000-participant capacity question:** project codes already use
3-digit padding per sector per year (`database/10_scale_fixes.sql`), so
each of the 6 sectors supports up to 999 registrations/year — comfortably
past 1000 total. The other real bottleneck at that scale is Supabase's
free tier: 1GB Storage and 500MB DB are easy to exceed once participants
start uploading pitch decks/videos, and its default auth email sending is
rate-limited (the custom-SMTP setup in the Notifications section above
already addresses that half). Worth moving to a paid Supabase plan before
Phase 2 uploads open if you haven't already.

## Phase 2 form — simplified to 4 sections (video removed)

The participant's Phase 2 submission is now exactly 4 sections instead of the
earlier 3-tab/6-upload version:

1. **Pitch Deck** — one required upload (PDF/PPTX) + one optional
   "other supporting document" (down from up to 6).
2. **Bills** — a single required upload (PDF/DOC/DOCX/JPG/PNG) with all
   itemized costs, replacing the old typed line-item bill table.
3. **Passbook & PAN** — passbook page 1 photo (required) + PAN photo, one
   side (optional) — no more manually-typed bank account holder/number/
   IFSC/bank name fields.
4. **Mentor Request** — new Yes/No dropdown: does the team want a mentor
   assigned to this project.

**Pitch/prototype video upload has been removed entirely** — the largest
per-team Storage cost, and the free-tier bottleneck flagged earlier in this
README. (Still to do: swap Phase 4's video field, and re-add Phase 2 video
as a YouTube/Drive link, per the plan discussed but not yet built.)

Run `database/14_phase2_form_v2.sql` after `13_phase2_uploads.sql`. It only
*adds* `bills_doc_url` and `mentor_requested` — the old now-unused columns
(`pitch_summary`, `amount_requested`, `pitch_video_url`,
`research_paper_url`, the four `bank_*` columns) and the old
`phase2_bill_items` table are left in place rather than dropped, in case
any real submissions already used them.

Secretary side updated to match: the Phase 2 queue and review modal now
show a Bills document link, Passbook/PAN links, and the Mentor Requested
answer instead of typed bank details and the bill-items table. The
spreadsheet export's columns were updated the same way.

## Phase 2 — Review & Submit, and spreadsheet-driven Phase 3 shortlisting

**New setup step:** run `database/16_phase3_review_and_notify.sql` after
`15_bank_pan_manual_fields.sql`. No new npm packages this time.

- **Participant side:** a 5th "Review & Submit" tab on the Phase 2 form —
  a checklist of all 4 sections (click any row to jump straight to it),
  disabled until pitch deck + bills + bank/PAN are complete, and a Submit
  button that stamps `phase2_applications.submitted_at`. This is a soft
  lock, not a hard one — participants can still edit afterward, and
  re-submitting just updates the timestamp. The Secretary's export uses
  this to show who's actually finished vs. still mid-form.

- **Secretary side, bulk accept/reject via spreadsheet:** the exported
  `.xlsx` now has a **"Phase 3 Decision"** column right after Project Code,
  with a real Excel dropdown (Accept/Reject — pre-filled from any existing
  decision, color-coded green/red) and a **"Submitted"** Yes/No column.
  Workflow: download → open in Excel → for each project, click the
  document links to review, pick Accept/Reject from the dropdown → save →
  upload the same file back via the new **"⬆ Upload Reviewed Spreadsheet"**
  button next to the download button.

  `app/api/secretary/phase2-import/route.ts` parses every sector sheet
  (skips "Summary" automatically, and skips any sheet that isn't shaped
  like our export rather than erroring the whole import), matches rows by
  Project Code, and bulk-updates `teams.status` /
  `phase2_applications.funding_status`. It reports back exactly what
  happened — accepted count, rejected count, project codes it couldn't
  find, and any decision cell it couldn't parse — rather than failing
  silently or all-or-nothing.

  **Safety guard:** only teams still at `shortlisted_phase2` are touched.
  If you re-upload an old copy of the spreadsheet after a team has already
  progressed (e.g. to `funded`), that row is silently skipped instead of
  reverting real progress — the response's `alreadyDecided` count tells you
  how many rows this happened to.

- **Notifications:** a new DB trigger (`trg_notify_phase3_shortlist`,
  mirrors the existing Phase 2 one) auto-queues a `phase3_shortlisted`
  email + WhatsApp notification the moment `teams.status` becomes
  `shortlisted_phase3` — whether that happens via the spreadsheet import
  above, or the existing single-project modal (which, until this change,
  didn't notify participants of Phase 3 selection at all).

## Bug fix: "Assign Mentor & Ambassador" always failed

**New setup step:** run `database/17_fix_assignment_notification_type_cast.sql`
after `16_phase3_review_and_notify.sql`.

**Root cause found during end-to-end testing against a live project:** every
attempt to assign a mentor or ambassador from the Secretary's Phase 3 screen
failed with `column "type" is of type notification_type but expression is of
type text`, and the whole assignment silently rolled back. The
`after_assignment_created()` trigger (`06_phase3_automation.sql`) picks the
notification type with a `CASE ... THEN 'mentor_assigned' ELSE
'ambassador_assigned' END` expression — Postgres infers a bare `CASE`
expression's type as `text` rather than as an untyped literal, and `text`
doesn't implicitly cast to the `notification_type` enum, so the insert into
`notification_queue` (and therefore the whole triggering insert into
`project_assignments`) failed every time. Fixed by casting the `CASE`
result to `::notification_type` explicitly.

**Also fixed:** the participant's Phase 4 final-submission panel
(`components/participant/workspace-tab.tsx`) was gated on
`teams.status in ('funded', 'completed')`, but no code path anywhere in the
app ever sets a team to either of those values — the Secretary's own Phase 4
scoring table already lists `shortlisted_phase3` teams, so participants could
never actually reach the submission form their own Secretary was scoring.
Now gated on the same `shortlisted_phase3 | funded | completed` set the rest
of Phase 3+ already uses.

## Status: all 4 portals now have complete, real backend functionality

Every major screen from the reference portal screenshots is now wired to
real data with real actions — registration, funding decisions, mentor/
ambassador assignment, joint evaluations, milestones, daily timeline,
discussion board, Phase 4 submissions, staff invites, and edit requests.

Remaining lower-priority items: Phase Engine (open/close scheduling UI),
Email Templates admin editor — both have their database tables ready, just
no UI yet.
