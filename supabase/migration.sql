-- ============================================================================
-- Avetisyan Beauty Clinic — Supabase schema migration
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Replaces Firebase Firestore + Storage with Postgres + Supabase Storage.
-- All public reads are allowed on content tables (matches current Firestore
-- rules where `site/{docId}`, `ai_knowledge` were world-readable). Writes
-- are admin-only: enforced by RLS using the service role key on the server
-- (server.ts bypasses RLS via service role client) and by the existing
-- JWT-cookie `requireAdmin` middleware on /api/db/* endpoints.
-- ============================================================================

-- ---------- Extensions ------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- 1. Site content (replaces Firestore `site/{docId}`) -------------
-- One row per logical document: content, gallery, settings, ai_settings.
-- `data` is JSONB — same shape as the Firestore doc, no migration of fields
-- needed (the existing stores keep their structure verbatim).
create table if not exists public.site (
  key         text primary key,            -- 'content' | 'gallery' | 'settings' | 'ai_settings'
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.site enable row level security;

-- Public read (matches Firestore rules: site/{docId} world-readable).
drop policy if exists "site_public_read" on public.site;
create policy "site_public_read" on public.site
  for select using (true);

-- Writes go through the server (service role key bypasses RLS).
drop policy if exists "site_no_public_write" on public.site;
-- (No INSERT/UPDATE/DELETE policy => only service role can write.)


-- ---------- 2. AI knowledge base (replaces Firestore `ai_knowledge/{id}`) ---
create table if not exists public.ai_knowledge (
  id                    uuid primary key default gen_random_uuid(),
  category              text not null default '',
  question              text not null default '',
  answer_hy             text not null default '',
  answer_ru             text not null default '',
  answer_en             text not null default '',
  service_slug          text,
  is_active             boolean not null default true,
  requires_human_review boolean not null default false,
  created_at            bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at            bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists ai_knowledge_active_idx
  on public.ai_knowledge (is_active);

alter table public.ai_knowledge enable row level security;

drop policy if exists "ai_knowledge_public_read" on public.ai_knowledge;
create policy "ai_knowledge_public_read" on public.ai_knowledge
  for select using (true);


-- ---------- 3. AI threads (replaces Firestore `ai_threads/{id}`) ------------
create table if not exists public.ai_threads (
  id                  uuid primary key default gen_random_uuid(),
  channel             text not null check (channel in ('instagram','whatsapp')),
  external_thread_id  text not null,
  customer_name       text not null default '',
  customer_handle     text not null default '',
  language            text not null default 'unknown',
  status              text not null default 'new',
  assigned_to         text,
  created_at          bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at          bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create unique index if not exists ai_threads_channel_ext_uniq
  on public.ai_threads (channel, external_thread_id);

create index if not exists ai_threads_updated_at_idx
  on public.ai_threads (updated_at desc);

alter table public.ai_threads enable row level security;

-- Threads are admin-only (matches Firestore rules).
-- No SELECT policy => only service role can read.


-- ---------- 4. AI messages (replaces `ai_threads/{id}/messages/{id}`) -------
create table if not exists public.ai_messages (
  id                  uuid primary key default gen_random_uuid(),
  thread_id           uuid not null references public.ai_threads(id) on delete cascade,
  direction           text not null check (direction in ('inbound','outbound')),
  channel             text not null check (channel in ('instagram','whatsapp')),
  original_text       text not null default '',
  detected_language   text,
  ai_suggested_reply  text,
  final_reply         text,
  status              text not null default 'new',
  confidence          double precision,
  requires_human      boolean not null default false,
  created_at          bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists ai_messages_thread_created_idx
  on public.ai_messages (thread_id, created_at asc);

alter table public.ai_messages enable row level security;

-- Admin-only reads/writes; service role bypasses RLS.


-- ---------- 5. Realtime publication -----------------------------------------
-- Supabase Realtime does not publish tables by default. Add all four so the
-- admin Inbox / Settings / Knowledge panels receive live updates.
do $$
begin
  begin
    alter publication supabase_realtime add table public.site;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ai_knowledge;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ai_threads;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ai_messages;
  exception when duplicate_object then null;
  end;
end $$;


-- ---------- 6. Storage bucket for uploads -----------------------------------
-- Creates a public-read bucket called `uploads` (replaces Firebase Storage
-- `uploads/` prefix). Public-read is required because the site displays
-- these images/videos to anonymous visitors.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Public-read policy on the uploads bucket.
drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read" on storage.objects
  for select
  using (bucket_id = 'uploads');

-- Authenticated uploads. In practice, uploads happen server-side via the
-- service role key (POST /api/upload), so this policy is a fallback for
-- any future direct-to-Supabase client uploads.
drop policy if exists "uploads_authenticated_write" on storage.objects;
create policy "uploads_authenticated_write" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'uploads');

drop policy if exists "uploads_authenticated_delete" on storage.objects;
create policy "uploads_authenticated_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'uploads');


-- ---------- 7. Seed default rows so the client reads succeed ---------------
insert into public.site (key, data) values
  ('content',     '{}'::jsonb),
  ('gallery',     '{"cases":[]}'::jsonb),
  ('settings',    '{}'::jsonb),
  ('ai_settings', '{}'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
-- End of migration. After running this:
--   1. Copy Project URL + anon key → VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
--   2. Copy service role key       → SUPABASE_SERVICE_ROLE_KEY (server only)
-- ============================================================================
