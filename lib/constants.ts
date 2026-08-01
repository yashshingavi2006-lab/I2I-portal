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
