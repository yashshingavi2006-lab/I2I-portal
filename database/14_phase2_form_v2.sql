-- ============================================================================
-- PHASE 2 FORM v2 — simplified to 4 sections: Pitch Deck, Bills, Passbook +
-- PAN, and a Yes/No mentor request. Removes the pitch/prototype video
-- upload entirely (to save Supabase Storage) and replaces the itemized
-- bill-line-items table with a single uploaded bills/quotations document.
--
-- Run this after 13_phase2_uploads.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns.
-- ----------------------------------------------------------------------------
alter table phase2_applications
  add column if not exists bills_doc_url text,
  add column if not exists mentor_requested boolean;

comment on column phase2_applications.bills_doc_url is
  'Storage path to the single uploaded bills/quotations document (replaces the old phase2_bill_items line-item table for new submissions).';
comment on column phase2_applications.mentor_requested is
  'Whether the team wants a mentor assigned for this project. null = not answered yet, true = Yes, false = No.';

-- ----------------------------------------------------------------------------
-- 2. Columns intentionally NOT dropped, to avoid destroying any data
--    already collected under the old form: pitch_summary, amount_requested,
--    pitch_video_url, research_paper_url, bank_account_holder,
--    bank_account_number, bank_ifsc, bank_name. The app no longer reads or
--    writes these, but they're left in place — drop them later in a
--    separate migration once you've confirmed you don't need the old data
--    (e.g. `alter table phase2_applications drop column pitch_summary;` etc).
--
--    phase2_bill_items (the old itemized bill table) is likewise left as-is
--    and simply unused by new submissions.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 3. The phase2-uploads Storage bucket's 100MB file_size_limit (set in
--    13_phase2_uploads.sql for the now-removed video upload) is left as a
--    ceiling — harmless to leave higher than needed, and avoids touching
--    Storage config for a config that only ever enforces a max, never a
--    minimum.
-- ----------------------------------------------------------------------------
