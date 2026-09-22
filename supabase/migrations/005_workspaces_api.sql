-- 005: Multi-workspace + API keys + audit + activity email fields
-- Safe to run after 001–004. Assigns existing rows to workspace "tci".

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Activity type: email (separate statement for PG enum rules)
-- ---------------------------------------------------------------------------
alter type public.activity_type add value if not exists 'email';

-- ---------------------------------------------------------------------------
-- Workspaces
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'crm'
    check (type in ('crm', 'personal', 'sales', 'sponsorship', 'other')),
  template text not null default 'generic'
    check (template in ('sponsorship', 'sales', 'generic', 'personal')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx
  on public.workspace_members (user_id);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  scopes text[] not null default '{}',
  active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_workspace_id_idx
  on public.api_keys (workspace_id);
create index if not exists api_keys_key_hash_idx
  on public.api_keys (key_hash);

create table if not exists public.workspace_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  key text not null,
  content text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create table if not exists public.workspace_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  key text not null,
  label text not null,
  definition text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create table if not exists public.workspace_field_defs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity text not null
    check (entity in ('company', 'contact', 'deal', 'activity')),
  key text not null,
  label text not null,
  field_type text not null default 'text'
    check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'textarea')),
  required boolean not null default false,
  options jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, entity, key)
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  actor_type text not null
    check (actor_type in ('user', 'api', 'integration', 'assistant')),
  actor_id text,
  action text not null,
  entity_type text,
  entity_id text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_workspace_created_idx
  on public.audit_logs (workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Seed TCI workspace (fixed id for deterministic backfill)
-- ---------------------------------------------------------------------------
insert into public.workspaces (id, name, slug, type, template)
values (
  'a0000000-0000-4000-8000-000000000001',
  'The Cartel Insider',
  'tci',
  'sponsorship',
  'sponsorship'
)
on conflict (slug) do nothing;

-- Pipeline stages for TCI
insert into public.pipeline_stages (workspace_id, name, sort_order, is_closed)
values
  ('a0000000-0000-4000-8000-000000000001', 'Researching', 0, false),
  ('a0000000-0000-4000-8000-000000000001', 'Contacted', 1, false),
  ('a0000000-0000-4000-8000-000000000001', 'Follow-up', 2, false),
  ('a0000000-0000-4000-8000-000000000001', 'Interested', 3, false),
  ('a0000000-0000-4000-8000-000000000001', 'Negotiating', 4, false),
  ('a0000000-0000-4000-8000-000000000001', 'Sponsor Won', 5, true),
  ('a0000000-0000-4000-8000-000000000001', 'Not Now', 6, true),
  ('a0000000-0000-4000-8000-000000000001', 'Lost', 7, true)
on conflict (workspace_id, name) do nothing;

-- TCI rules
insert into public.workspace_rules (workspace_id, key, content, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', 'email_signature', 'Sign emails as "The Cartel Insider Team"', 0),
  ('a0000000-0000-4000-8000-000000000001', 'creator_privacy', 'Creator identity is private. Never expose creator personal information.', 1),
  ('a0000000-0000-4000-8000-000000000001', 'paid_preferred', 'Paid sponsorship preferred; affiliate can be secondary.', 2),
  ('a0000000-0000-4000-8000-000000000001', 'no_invented_contacts', 'Never invent contact information.', 3),
  ('a0000000-0000-4000-8000-000000000001', 'metrics_separate', 'YouTube and Instagram metrics must be kept separate.', 4),
  ('a0000000-0000-4000-8000-000000000001', 'nda_before_pii', 'NDA before sharing sensitive personal data.', 5)
on conflict (workspace_id, key) do nothing;

-- TCI metrics
insert into public.workspace_metrics (workspace_id, key, label, definition, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', 'youtube_fit', 'YouTube Fit', '1–5 score for YouTube sponsorship fit', 0),
  ('a0000000-0000-4000-8000-000000000001', 'instagram_fit', 'Instagram Fit', '1–5 score for Instagram sponsorship fit', 1),
  ('a0000000-0000-4000-8000-000000000001', 'weighted_score', 'Weighted Score', 'Composite priority score for outreach ranking', 2)
on conflict (workspace_id, key) do nothing;

-- TCI field defs (Sponsorship CRM)
insert into public.workspace_field_defs (workspace_id, entity, key, label, field_type, required, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', 'company', 'priority', 'Priority', 'select', false, 0),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'score', 'Weighted Score', 'number', false, 1),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'youtube_fit', 'YouTube Fit', 'number', false, 2),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'instagram_fit', 'Instagram Fit', 'number', false, 3),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'status', 'Company Status', 'select', false, 4),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'last_contact', 'Last Contact', 'date', false, 5),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'next_followup', 'Next Follow-up', 'date', false, 6),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'next_action', 'Next Action', 'text', false, 7),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'notes', 'Notes', 'textarea', false, 8),
  ('a0000000-0000-4000-8000-000000000001', 'company', 'evidence', 'Evidence', 'textarea', false, 9)
on conflict (workspace_id, entity, key) do nothing;

-- Add all existing auth users as owners of TCI
insert into public.workspace_members (workspace_id, user_id, role)
select 'a0000000-0000-4000-8000-000000000001', id, 'owner'
from auth.users
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Alter core tables: workspace_id, domain, custom_data, activity email cols
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists workspace_id uuid references public.workspaces (id);

alter table public.contacts
  add column if not exists workspace_id uuid references public.workspaces (id);

alter table public.deals
  add column if not exists workspace_id uuid references public.workspaces (id);

alter table public.activities
  add column if not exists workspace_id uuid references public.workspaces (id);

update public.companies
set workspace_id = 'a0000000-0000-4000-8000-000000000001'
where workspace_id is null;

update public.contacts
set workspace_id = 'a0000000-0000-4000-8000-000000000001'
where workspace_id is null;

update public.deals
set workspace_id = 'a0000000-0000-4000-8000-000000000001'
where workspace_id is null;

update public.activities
set workspace_id = 'a0000000-0000-4000-8000-000000000001'
where workspace_id is null;

alter table public.companies
  alter column workspace_id set not null;
alter table public.contacts
  alter column workspace_id set not null;
alter table public.deals
  alter column workspace_id set not null;
alter table public.activities
  alter column workspace_id set not null;

alter table public.companies
  add column if not exists domain text,
  add column if not exists custom_data jsonb not null default '{}'::jsonb;

alter table public.contacts
  add column if not exists custom_data jsonb not null default '{}'::jsonb;

alter table public.deals
  add column if not exists custom_data jsonb not null default '{}'::jsonb;

-- Backfill domain from website
update public.companies
set domain = lower(
  regexp_replace(
    regexp_replace(coalesce(website, ''), '^https?://', '', 'i'),
    '/.*$',
    ''
  )
)
where domain is null and website is not null and website <> '';

-- Unique company name per workspace
alter table public.companies drop constraint if exists companies_user_id_name_key;
do $$ begin
  alter table public.companies
    add constraint companies_workspace_id_name_key unique (workspace_id, name);
exception when duplicate_object then null;
end $$;

create index if not exists companies_workspace_id_idx on public.companies (workspace_id);
create index if not exists companies_domain_idx on public.companies (workspace_id, domain);
create index if not exists contacts_workspace_id_idx on public.contacts (workspace_id);
create index if not exists contacts_email_idx on public.contacts (workspace_id, email);
create index if not exists deals_workspace_id_idx on public.deals (workspace_id);
create index if not exists activities_workspace_id_idx on public.activities (workspace_id);

-- Activity email / Gmail fields
alter table public.activities
  add column if not exists subject text,
  add column if not exists summary text,
  add column if not exists direction text
    check (direction is null or direction in ('inbound', 'outbound')),
  add column if not exists external_thread_id text,
  add column if not exists external_message_id text;

-- ---------------------------------------------------------------------------
-- Helper: membership check
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.api_keys enable row level security;
alter table public.workspace_rules enable row level security;
alter table public.workspace_metrics enable row level security;
alter table public.workspace_field_defs enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "workspaces_member_select" on public.workspaces;
create policy "workspaces_member_select" on public.workspaces
  for select using (public.is_workspace_member(id));

drop policy if exists "workspaces_member_insert" on public.workspaces;
create policy "workspaces_member_insert" on public.workspaces
  for insert with check (auth.uid() is not null);

drop policy if exists "workspaces_member_update" on public.workspaces;
create policy "workspaces_member_update" on public.workspaces
  for update using (public.is_workspace_member(id));

drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

drop policy if exists "workspace_members_insert" on public.workspace_members;
create policy "workspace_members_insert" on public.workspace_members
  for insert with check (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists "api_keys_member_all" on public.api_keys;
create policy "api_keys_member_all" on public.api_keys
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_rules_member_all" on public.workspace_rules;
create policy "workspace_rules_member_all" on public.workspace_rules
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_metrics_member_all" on public.workspace_metrics;
create policy "workspace_metrics_member_all" on public.workspace_metrics
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_field_defs_member_all" on public.workspace_field_defs;
create policy "workspace_field_defs_member_all" on public.workspace_field_defs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "pipeline_stages_member_all" on public.pipeline_stages;
create policy "pipeline_stages_member_all" on public.pipeline_stages
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "audit_logs_member_select" on public.audit_logs;
create policy "audit_logs_member_select" on public.audit_logs
  for select using (public.is_workspace_member(workspace_id));

drop policy if exists "audit_logs_member_insert" on public.audit_logs;
create policy "audit_logs_member_insert" on public.audit_logs
  for insert with check (public.is_workspace_member(workspace_id));

-- Replace business-table RLS to require workspace membership
drop policy if exists "companies_own_all" on public.companies;
create policy "companies_workspace_all" on public.companies
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "contacts_own_all" on public.contacts;
create policy "contacts_workspace_all" on public.contacts
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "deals_own_all" on public.deals;
create policy "deals_workspace_all" on public.deals
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "activities_own_all" on public.activities;
create policy "activities_workspace_all" on public.activities
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
