-- The Cartel Insider CRM — initial schema
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.priority_level as enum ('A+', 'A', 'B', 'C');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deal_stage as enum (
    'Researching',
    'Ready to Contact',
    'Contacted',
    'Waiting Reply',
    'Follow-up',
    'Interested',
    'Media Kit Sent',
    'Negotiating',
    'Sponsor Won',
    'Not Now',
    'Lost'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_type as enum (
    'email_sent',
    'linkedin_message',
    'instagram_dm',
    'form_submitted',
    'follow_up',
    'reply',
    'call',
    'note'
  );
exception when duplicate_object then null;
end $$;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  website text,
  category text,
  priority public.priority_level,
  youtube_fit smallint check (youtube_fit is null or youtube_fit between 1 and 5),
  instagram_fit smallint check (instagram_fit is null or instagram_fit between 1 and 5),
  creator_spend smallint check (creator_spend is null or creator_spend between 1 and 5),
  thematic_fit smallint check (thematic_fit is null or thematic_fit between 1 and 5),
  contactability smallint check (contactability is null or contactability between 1 and 5),
  score numeric(4, 2),
  evidence text,
  comparable_channels text,
  personalization_hook text,
  exclusivity_conflicts text,
  evidence_url text,
  evidence_confidence text,
  primary_outreach_channel text,
  official_creator_form text,
  influencer_email text,
  instagram_dm_suitable boolean,
  press_kit_required boolean,
  affiliate_program boolean,
  paid_sponsorship_confirmed boolean,
  status text default 'Not contacted',
  next_action text,
  last_contact date,
  next_followup date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists companies_status_idx on public.companies (status);
create index if not exists companies_priority_idx on public.companies (priority);
create index if not exists companies_next_followup_idx on public.companies (next_followup);
create index if not exists companies_user_id_idx on public.companies (user_id);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- Contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  contact_rank integer,
  job_title text,
  employer text,
  contact_type text,
  email text,
  linkedin_url text,
  why_this_contact text,
  verification_confidence text,
  researched_at date,
  source_url text,
  personalization text,
  outreach_status text,
  last_contact date,
  next_followup date,
  notes text,
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_company_id_idx on public.contacts (company_id);
create index if not exists contacts_next_followup_idx on public.contacts (next_followup);
create index if not exists contacts_user_id_idx on public.contacts (user_id);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Deals
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  stage public.deal_stage not null default 'Researching',
  priority public.priority_level,
  category text,
  score numeric(4, 2),
  value numeric(12, 2),
  currency text not null default 'EUR',
  youtube_rate numeric(12, 2),
  instagram_rate numeric(12, 2),
  bundle_rate numeric(12, 2),
  next_action text,
  last_contact date,
  next_followup date,
  exclusivity text,
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_stage_idx on public.deals (stage);
create index if not exists deals_company_id_idx on public.deals (company_id);
create index if not exists deals_next_followup_idx on public.deals (next_followup);
create index if not exists deals_user_id_idx on public.deals (user_id);

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  deal_id uuid references public.deals (id) on delete set null,
  type public.activity_type not null,
  happened_at timestamptz not null default now(),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_company_happened_idx
  on public.activities (company_id, happened_at desc);
create index if not exists activities_user_id_idx on public.activities (user_id);

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- RLS
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;

drop policy if exists "companies_own_all" on public.companies;
create policy "companies_own_all" on public.companies
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "contacts_own_all" on public.contacts;
create policy "contacts_own_all" on public.contacts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "deals_own_all" on public.deals;
create policy "deals_own_all" on public.deals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "activities_own_all" on public.activities;
create policy "activities_own_all" on public.activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
