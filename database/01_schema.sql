-- ============================================================================
-- I2I PORTAL — CORE SCHEMA
-- Bhau Institute of Innovation, Entrepreneurship & Leadership, COEP
-- ============================================================================
-- Run this in the Supabase SQL editor, in order: 01_schema.sql, 02_functions.sql,
-- 03_rls_policies.sql, 04_seed_sectors.sql
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ROLES
-- ----------------------------------------------------------------------------
-- secretary        : full access, all data, all phases, manages role assignments
-- chief_ambassador : access scoped by secretary (e.g. a set of sectors/colleges)
-- ambassador       : access only to teams explicitly assigned to them
-- mentor           : access only to the 1-3 projects assigned to them
-- head             : functional heads (web dev, events, eaton relations, etc.)
--                     — scope defined per-head via the `access_scopes` table
create type user_role as enum (
  'secretary',
  'chief_ambassador',
  'ambassador',
  'mentor',
  'head'
);

-- Extends Supabase's built-in auth.users with I2I-specific profile + role info.
-- This table is for INTERNAL PORTAL STAFF (secretary, ambassadors, mentors, heads)
-- — NOT for participant team leaders, who are handled separately below.
create table staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role user_role not null,
  head_title text, -- e.g. 'Web Dev Head', 'Eaton Relations Head' — only used when role = 'head'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SECTORS  (drives the project code prefix, e.g. ENV, EDU, INN, ENT, HHH)
-- ----------------------------------------------------------------------------
create table sectors (
  id uuid primary key default gen_random_uuid(),
  prefix text not null unique check (char_length(prefix) between 2 and 4), -- e.g. 'ENV'
  display_name text not null,            -- e.g. 'Environment' — update once you send full names
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Fine-grained scoping for chief_ambassadors / heads whose access is a defined
-- subset rather than "everything" or "only my assigned teams".
-- e.g. a chief ambassador scoped to sectors ['ENV','EDU'] only.
create table access_scopes (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  sector_id uuid references sectors(id),
  college_name text,
  created_at timestamptz not null default now()
);

-- Per-sector, per-year running counter for project codes.
-- e.g. (sector_id = ENV's id, year = 2026, last_number = 11)
create table project_code_counters (
  sector_id uuid not null references sectors(id),
  year int not null,
  last_number int not null default 0,
  primary key (sector_id, year)
);

-- ----------------------------------------------------------------------------
-- TEAMS  (Phase 1 registration)
-- ----------------------------------------------------------------------------
create table teams (
  id uuid primary key default gen_random_uuid(),
  registration_year int not null default extract(year from now())::int,
  team_name text not null,
  team_size int not null check (team_size between 1 and 3),

  -- auto-generated once registration is confirmed, e.g. 'ENV202601'
  project_code text unique,

  sector_id uuid not null references sectors(id),

  -- Page 1: team leader (this is the ONLY member with portal login access)
  leader_auth_id uuid references auth.users(id) on delete set null,
  leader_name text not null,
  leader_email text not null,
  leader_phone text not null,
  leader_whatsapp_optin boolean default true,
  leader_gender text,
  leader_dob date,
  emergency_contact_name text,
  emergency_contact_phone text,
  heard_about_us text, -- Instagram / Ambassador / Faculty / Friend / Poster-Event / Other

  -- Page 2: location & institution
  state text not null,
  city text not null,
  college_name text not null,
  college_type text, -- Engineering / Arts & Commerce / Management / Polytechnic / School / Other
  faculty_contact_name text,
  faculty_contact_phone text,

  -- Page 3: sector detail
  sub_theme text,
  sdg_tags text[], -- optional multi-select of Sustainable Development Goals

  -- Page 4: project
  project_name text not null,
  problem_statement text not null,
  proposed_solution text not null,
  target_beneficiaries text not null,
  innovation_notes text,
  idea_stage text, -- Concept only / Prototype exists / Already piloted
  supporting_doc_url text, -- Supabase Storage path

  consent_given boolean not null default false,

  -- workflow status
  status text not null default 'registered'
    check (status in ('registered','under_review','shortlisted_phase2','rejected',
                       'shortlisted_phase3','funded','completed','withdrawn')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teams_sector on teams(sector_id);
create index idx_teams_status on teams(status);
create index idx_teams_leader_auth on teams(leader_auth_id);

-- Members other than the leader (data-only, no login — per your spec)
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  year_of_study text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PHASE 2 — funding application
-- ----------------------------------------------------------------------------
create table phase2_applications (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references teams(id) on delete cascade,

  pitch_summary text,
  pitch_deck_url text,

  bank_account_holder text,
  bank_account_number text,
  bank_ifsc text,
  bank_name text,
  bank_branch text,
  passbook_doc_url text,
  pan_doc_url text,

  funding_requested boolean not null default false,
  amount_requested numeric(10,2),
  amount_approved numeric(10,2),
  funding_status text not null default 'under_review'
    check (funding_status in ('under_review','approved','rejected','partial')),

  declaration_confirmed boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table phase2_bill_items (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references phase2_applications(id) on delete cascade,
  item_name text not null,
  description text,
  unit_cost numeric(10,2) not null,
  quantity int not null default 1,
  total_cost numeric(10,2) generated always as (unit_cost * quantity) stored,
  bill_doc_url text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PHASE 3 — mentor / ambassador assignment
-- ----------------------------------------------------------------------------
create table project_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  staff_id uuid not null references staff_profiles(id) on delete cascade,
  assignment_role text not null check (assignment_role in ('mentor','ambassador')),
  assigned_at timestamptz not null default now(),
  unique (team_id, assignment_role) -- one mentor + one ambassador per team
);

create index idx_assignments_staff on project_assignments(staff_id);
create index idx_assignments_team on project_assignments(team_id);

-- ----------------------------------------------------------------------------
-- updated_at auto-touch trigger (generic, reused across tables)
-- ----------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_teams_touch before update on teams
  for each row execute function touch_updated_at();
create trigger trg_phase2_touch before update on phase2_applications
  for each row execute function touch_updated_at();
