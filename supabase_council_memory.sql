-- ═══════════════════════════════════════════════════════════════
-- YESIDE & CO. — COUNCIL MEMORY SYSTEM
-- Run this in your Supabase SQL Editor (one time only)
-- ═══════════════════════════════════════════════════════════════

-- 1. FOUNDER PROFILE — key facts about Olakunle that grow over time
create table if not exists council_founder_profile (
  id         uuid primary key default uuid_generate_v4(),
  key        text unique not null,
  value      text not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. CONVERSATION STORAGE — every message per council member
create table if not exists council_conversations (
  id         uuid primary key default uuid_generate_v4(),
  member_id  text not null,
  role       text not null,    -- 'user' | 'assistant'
  content    text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. COUNCIL MEMORY — key insights extracted from conversations
create table if not exists council_memory (
  id          uuid primary key default uuid_generate_v4(),
  member_id   text not null,   -- 'chair' | 'ceo' | 'sales' | 'cmo' | 'coo' | 'cfo' | 'all'
  memory_type text not null,   -- 'decision' | 'insight' | 'context' | 'founder_fact'
  content     text not null,
  created_at  timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for fast retrieval
create index if not exists idx_council_convos_member  on council_conversations(member_id);
create index if not exists idx_council_convos_created on council_conversations(created_at desc);
create index if not exists idx_council_memory_member  on council_memory(member_id);
create index if not exists idx_council_fp_key         on council_founder_profile(key);

-- RLS — open access (private tool, anon key is fine)
alter table council_founder_profile enable row level security;
alter table council_conversations    enable row level security;
alter table council_memory           enable row level security;

drop policy if exists "Full access founder profile" on council_founder_profile;
drop policy if exists "Full access conversations"   on council_conversations;
drop policy if exists "Full access memory"          on council_memory;

create policy "Full access founder profile" on council_founder_profile for all using (true) with check (true);
create policy "Full access conversations"   on council_conversations    for all using (true) with check (true);
create policy "Full access memory"          on council_memory           for all using (true) with check (true);

-- Seed founder profile with accurate data
insert into council_founder_profile (key, value) values
  ('name',          'Tomori Olakunle John'),
  ('location',      'Lagos, Nigeria'),
  ('company',       'Yeside & Co. — named in honour of late mother Juliana Yeside Tomori (Cardoso)'),
  ('mission',       'Build digital products that change Nigeria and Africa. Reach ₦100M+ yearly. Change the lifestyle of family and siblings. Leave something that lasts.'),
  ('mother',        'Juliana Yeside Tomori (Cardoso) — late. Single-handedly raised 3 children from ages 3, 7, 10 after divorce. Strong, hardworking, intelligent, full of life, no nonsense. Ensured children had education, social life, and dignity. She is the Chair of Yeside & Co. and its founding standard.'),
  ('portfolio',     'Konnekt (konnekt.ng) — primary revenue focus, NFC + WhatsApp lead conversion. Notify.i.ng — Nigerian digital memorial platform. Ekibooks — WhatsApp voice note intelligence for SMEs. PNIGL/Konfem — merchant trust graph. Omniverse Solutions — sublimation printing and branded merchandise. Yesterday Studio — digital image branding.'),
  ('primary_focus', 'Konnekt — 50 paid subscribers by September 2026 at ₦3,500/month or ₦35,000/year.'),
  ('working_style', 'Solo founder. AI-assisted iterative builder. Uses Cursor, AI Studio, Claude. Deploys via GitHub → Vercel auto-deploy pipeline.'),
  ('konnekt_stack', 'React 19, TypeScript, Tailwind CSS, Vite, Supabase (postgres + auth + storage), Vercel (hosting + serverless), Paystack (payments), Evolution API (WhatsApp automation).')
on conflict (key) do update set value = excluded.value, updated_at = now();
