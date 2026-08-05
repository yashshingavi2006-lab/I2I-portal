-- ============================================================================
-- PHASE 2 — real file uploads (pitch deck, video, research paper, passbook,
-- PAN, misc. supporting docs) via Supabase Storage.
--
-- Run this after 12_registration_confirmed_type.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns on phase2_applications for the extra upload types.
--    pitch_deck_url / passbook_doc_url / pan_doc_url already existed
--    (01_schema.sql) — they're being repurposed to hold Storage paths
--    instead of external links, no migration needed for those.
-- ----------------------------------------------------------------------------
alter table phase2_applications
  add column if not exists pitch_video_url text,
  add column if not exists research_paper_url text,
  add column if not exists other_documents jsonb not null default '[]';
  -- other_documents: array of {"name": "...", "path": "...", "uploaded_at": "..."}

comment on column phase2_applications.other_documents is
  'Free-form extra supporting documents (letters of support, survey data, etc). Array of {name, path, uploaded_at}.';

-- ----------------------------------------------------------------------------
-- 2. Storage bucket. Private (not public) — every read goes through a
--    short-lived signed URL generated server-side, so files are never
--    guessable/world-readable even though the bucket holds bank passbooks.
-- ----------------------------------------------------------------------------
-- No bucket-level `allowed_mime_types` restriction on purpose: browsers are
-- inconsistent about the MIME type they report for .pptx/.mp4 (some send
-- application/octet-stream), and a mismatch there would reject a perfectly
-- valid upload with a confusing storage-layer error. File type is instead
-- enforced by extension + size in the upload UI (components/participant/
-- file-upload-field.tsx) before the request ever reaches Storage.
insert into storage.buckets (id, name, public, file_size_limit)
values ('phase2-uploads', 'phase2-uploads', false, 104857600) -- 100 MB ceiling (video is the largest accepted type)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- ----------------------------------------------------------------------------
-- 3. RLS on storage.objects for this bucket.
--    Path convention: phase2-uploads/{team_id}/{kind}-{filename}
--    so storage.foldername(name)[1] is always the team_id.
-- ----------------------------------------------------------------------------
create policy phase2_uploads_leader_all on storage.objects
  for all
  using (
    bucket_id = 'phase2-uploads'
    and exists (
      select 1 from teams t
      where t.id::text = (storage.foldername(name))[1]
      and t.leader_auth_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'phase2-uploads'
    and exists (
      select 1 from teams t
      where t.id::text = (storage.foldername(name))[1]
      and t.leader_auth_id = auth.uid()
    )
  );

create policy phase2_uploads_secretary_all on storage.objects
  for all
  using (bucket_id = 'phase2-uploads' and is_secretary())
  with check (bucket_id = 'phase2-uploads' and is_secretary());

-- Assigned mentor/ambassador can view (not overwrite) a team's uploads.
create policy phase2_uploads_assigned_staff_read on storage.objects
  for select
  using (
    bucket_id = 'phase2-uploads'
    and exists (
      select 1 from project_assignments pa
      join teams t on t.id = pa.team_id
      where t.id::text = (storage.foldername(name))[1]
      and pa.staff_id = auth.uid()
    )
  );
