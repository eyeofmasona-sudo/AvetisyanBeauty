-- ============================================================================
-- Avetisyan Beauty Clinic — WhatsApp OAuth extension migration
-- Run in Supabase SQL Editor after migration_meta_oauth.sql
-- ============================================================================

-- ---------- Extend social_integrations with WhatsApp-specific fields -------
-- All WhatsApp fields are nullable so the same table can hold both Instagram
-- and WhatsApp integrations (provider column distinguishes them).
alter table public.social_integrations
  add column if not exists meta_business_id           text,
  add column if not exists whatsapp_business_account_id text,
  add column if not exists whatsapp_phone_number_id   text,
  add column if not exists display_phone_number       text,
  add column if not exists verified_name              text,
  add column if not exists webhook_verify_token       text,    -- plaintext, used to verify incoming webhooks
  add column if not exists webhook_status             text,    -- 'subscribed' | 'pending' | 'failed' | 'not_configured'
  add column if not exists last_message_at            timestamptz;

-- Drop the old "one active per provider" unique index and replace with a
-- proper partial unique index that allows both instagram + whatsapp active
-- simultaneously (one each).
drop index if exists social_integrations_active_uniq;
create unique index social_integrations_active_uniq
  on public.social_integrations (provider) where status = 'active';

-- ============================================================================
-- End of migration
-- ============================================================================
