// Confirmed sector list for 2026-27.
// These MUST match the `prefix` values seeded in database/04_seed_sectors.sql.
// NOTE: "Agriculture" was not in the original 5 prefixes you sent — I've
// given it the prefix AGR (no conflicts with the others). Flag if you'd
// prefer a different one.
export const SECTORS = [
  { prefix: "HHH", label: "3H — Health, Hunger & Humanity" },
  { prefix: "AGR", label: "Agriculture" },
  { prefix: "EDU", label: "Education" },
  { prefix: "INN", label: "Innovation & Technology" },
  { prefix: "ENV", label: "Environment" },
  { prefix: "ENT", label: "Entrepreneurship / Skill Development" },
] as const;

export const COLLEGE_TYPES = [
  "Engineering",
  "Arts & Commerce",
  "Management",
  "Polytechnic",
  "School",
  "Other",
] as const;

export const HEARD_ABOUT_OPTIONS = [
  "Instagram",
  "College Ambassador",
  "Faculty",
  "Friend",
  "Poster / Event",
  "Other",
] as const;

export const IDEA_STAGES = [
  "Concept only",
  "Prototype exists",
  "Already piloted",
] as const;

export const INDIAN_STATES = [
  "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh",
  "Rajasthan", "Madhya Pradesh", "West Bengal", "Telangana", "Andhra Pradesh",
  "Kerala", "Punjab", "Haryana", "Bihar", "Odisha", "Other",
] as const;

export const TEAM_SIZE_OPTIONS = [1, 2, 3] as const;

// PLACEHOLDER — update to the real Phase 1 registration deadline for 2026-27.
// Used by components/landing/countdown.tsx.
export const REGISTRATION_DEADLINE = new Date("2026-08-31T23:59:59+05:30");

// Phase 3 "Weekly Development Targets" — 8 fixed weeks spanning December and
// January. Only the date ranges live in code; the plans themselves are
// stored per team in the `weekly_targets` table (database/20_weekly_targets.sql).
// Update these if the actual program dates for a given cohort differ.
export const WEEKLY_TARGET_WEEKS: { week: number; start: string; end: string }[] = Array.from(
  { length: 8 },
  (_, i) => {
    const start = new Date(Date.UTC(2026, 11, 1 + i * 7)); // Dec 1, 2026 (UTC, date-only)
    const end = new Date(Date.UTC(2026, 11, 1 + i * 7 + 6));
    return { week: i + 1, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }
);
