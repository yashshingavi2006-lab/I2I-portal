-- ============================================================================
-- Run this in the Supabase SQL Editor against your live project.
-- Supports the new registration flow: participants set their password
-- during registration itself (no email dependency to get into the portal),
-- and get a confirmation email afterward instead of an invite-link email.
-- ============================================================================

alter type notification_type add value if not exists 'registration_confirmed';
