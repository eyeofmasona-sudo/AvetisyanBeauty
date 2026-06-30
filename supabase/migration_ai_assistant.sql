-- ============================================================================
-- Avetisyan Beauty Clinic — AI Assistant extension migration
-- Run in Supabase SQL Editor after the main migration.sql
-- ============================================================================

-- ---------- AI Reply Templates (replaces in-memory-only default templates) --
create table if not exists public.ai_templates (
  id            uuid primary key default gen_random_uuid(),
  intent        text not null default '',
  title         text not null default '',
  template_hy   text not null default '',
  template_ru   text not null default '',
  template_en   text not null default '',
  is_active     boolean not null default true,
  created_at    bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at    bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists ai_templates_active_idx on public.ai_templates (is_active);

alter table public.ai_templates enable row level security;
-- Public read (admin UI on browser reads via anon key)
drop policy if exists "ai_templates_public_read" on public.ai_templates;
create policy "ai_templates_public_read" on public.ai_templates
  for select using (true);


-- ---------- Meta (WhatsApp/Instagram) credentials --------------------------
-- Stored as encrypted JSON in the `site` table under key 'meta_credentials'.
-- We don't create a separate table — the admin only has one Meta app, and
-- storing it as a single JSON doc under `site` keeps things simple. Writes
-- go through /api/db/site/meta_credentials (admin cookie gated), and the
-- server uses this JSON to configure webhooks at boot.

-- (No DDL needed — uses existing public.site table.)


-- ---------- Realtime publication for templates ------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.ai_templates;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------- Seed default templates ------------------------------------------
insert into public.ai_templates (intent, title, template_hy, template_ru, template_en, is_active)
values
  ('price_question', 'Узнать цену',
   'Այս պրոցեդուրայի արժեքն է՝ կախված գոտիից։ Մանրամասների համար կարող եք զանգահարել մեզ։',
   'Стоимость данной процедуры зависит от зоны. Для подробностей позвоните нам.',
   'The cost of this procedure depends on the treatment area. Please call us for details.',
   true),
  ('appointment', 'Запись на приём',
   'Կարող եք ամրագրել այց՝ զանգահարելով +374 33 10 10 77 կամ WhatsApp-ով։',
   'Вы можете записаться на приём, позвонив по телефону +374 33 10 10 77 или через WhatsApp.',
   'You can book an appointment by calling +374 33 10 10 77 or via WhatsApp.',
   true),
  ('working_hours', 'Часы работы',
   'Մենք աշխատում ենք երկուշաբթիից շաբաթ՝ 10:00-20:00։',
   'Мы работаем с понедельника по субботу с 10:00 до 20:00.',
   'We are open Monday to Saturday, 10:00 AM to 8:00 PM.',
   true),
  ('location', 'Адрес',
   'Մենք գտնվում ենք Երևանում՝ Ամիրյան 18 հասցեում։',
   'Мы находимся в Ереване, ул. Амиряна 18.',
   'We are located in Yerevan, 18 Amiryan St.',
   true),
  ('contraindications', 'Противопоказания',
   'Կան որոշ հակացուցումներ։ Խնդրում ենք խորհրդակցել մեր մասնագետի հետ այցից առաջ։',
   'Имеются некоторые противопоказания. Пожалуйста, проконсультируйтесь с нашим специалистом до визита.',
   'There are some contraindications. Please consult with our specialist before your visit.',
   true)
on conflict do nothing;

-- ============================================================================
-- End of migration
-- ============================================================================
