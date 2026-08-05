-- ============================================================================
-- Run this in the Supabase SQL Editor against your live project, after
-- 14_phase2_form_v2.sql.
--
-- Restores manual bank-detail fields alongside the passbook photo (the app
-- previously moved to photo-only; both are now collected), and adds a
-- manual PAN number field to go with the required PAN photo.
-- bank_account_holder / bank_account_number / bank_ifsc / bank_name already
-- exist from 01_schema.sql and just need the app wired back up to them —
-- only pan_number is actually new.
-- ============================================================================

alter table phase2_applications
  add column if not exists pan_number text;

comment on column phase2_applications.pan_number is
  'Manually-entered PAN number, alongside the required pan_doc_url photo for verification.';
