-- ============================================================================
-- Avetisyan Beauty Clinic — Meta OAuth integration migration
-- Run in Supabase SQL Editor after migration_ai_assistant.sql
-- ============================================================================

-- ---------- social_integrations (Instagram via Meta OAuth) ------------------
-- Stores encrypted Meta access tokens for Instagram Business Account access.
-- Tokens are NEVER stored in plaintext — the application encrypts them with
-- AES-256-GCM using META_TOKEN_ENCRYPTION_KEY (env) before inserting.
create table if not exists public.social_integrations (
  id                       uuid primary key default gen_random_uuid(),
  provider                 text not null default 'instagram',
  facebook_page_id         text not null,
  facebook_page_name       text,
  instagram_account_id     text,
  instagram_username       text,
  instagram_profile_pic    text,
  access_token_encrypted   text not null,
  token_type               text not null default 'long_lived',
  token_expires_at         timestamptz,
  granted_scopes           text[] not null default '{}',
  status                   text not null default 'active',  -- 'active' | 'disconnected' | 'expired' | 'error'
  last_sync_at             timestamptz,
  last_error               text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Only one active integration per provider at a time
create unique index if not exists social_integrations_active_uniq
  on public.social_integrations (provider) where status = 'active';

create index if not exists social_integrations_provider_idx
  on public.social_integrations (provider, status);

alter table public.social_integrations enable row level security;

-- Admin-only reads (no anon policy → blocked by default for browser).
-- The server uses the service role key which bypasses RLS.

-- ---------- Instagram media cache (synced posts/reels) ---------------------
create table if not exists public.instagram_media (
  id                       text primary key,                 -- IG media id
  integration_id           uuid not null references public.social_integrations(id) on delete cascade,
  caption                  text,
  media_type               text not null,                    -- 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL'
  media_url                text,
  thumbnail_url            text,
  permalink                text not null,
  timestamp                timestamptz not null,
  synced_at                timestamptz not null default now()
);

create index if not exists instagram_media_integration_idx
  on public.instagram_media (integration_id, timestamp desc);

alter table public.instagram_media enable row level security;

-- Public read (carousel on homepage needs to display these without auth)
drop policy if exists "instagram_media_public_read" on public.instagram_media;
create policy "instagram_media_public_read" on public.instagram_media
  for select using (true);


-- ---------- Realtime publication --------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.social_integrations;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.instagram_media;
  exception when duplicate_object then null;
  end;
end $$;

-- ============================================================================
-- End of migration
-- ============================================================================
