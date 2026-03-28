-- GreenLight Realty CRM — Supabase Schema
-- Run this in your Supabase SQL editor

-- ─────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- Agents
-- ─────────────────────────────────────────
create table if not exists agents (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null unique,
  phone         text,
  active        boolean not null default true,
  access_leads  boolean not null default true,
  access_docs   boolean not null default false,
  access_msgs   boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table agents enable row level security;

-- Broker (authenticated) can do everything
create policy "Broker full access on agents"
  on agents for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────
-- Leads
-- ─────────────────────────────────────────
create table if not exists leads (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text,
  phone      text,
  status     text not null default 'Warm' check (status in ('Hot', 'Warm', 'Cold')),
  agent_id   uuid references agents(id) on delete set null,
  notes      text not null default '',
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "Broker full access on leads"
  on leads for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────
-- Messages
-- ─────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default uuid_generate_v4(),
  agent_id     uuid not null references agents(id) on delete cascade,
  body         text not null,
  from_broker  boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Broker full access on messages"
  on messages for all
  to authenticated
  using (true)
  with check (true);

-- Service role can insert (for Twilio webhook & API routes)
create policy "Service role insert messages"
  on messages for insert
  to service_role
  using (true)
  with check (true);

-- ─────────────────────────────────────────
-- Documents
-- ─────────────────────────────────────────
create table if not exists documents (
  id             uuid primary key default uuid_generate_v4(),
  file_name      text not null,
  file_url       text,
  status         text not null default 'Pending' check (status in ('Pending', 'Processing', 'Scanned')),
  extracted_data jsonb,
  created_at     timestamptz not null default now()
);

alter table documents enable row level security;

create policy "Broker full access on documents"
  on documents for all
  to authenticated
  using (true)
  with check (true);

create policy "Service role full access on documents"
  on documents for all
  to service_role
  using (true)
  with check (true);

-- ─────────────────────────────────────────
-- Storage bucket for document uploads
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('glr-docs', 'glr-docs', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload and read files
create policy "Broker upload glr-docs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'glr-docs');

create policy "Broker read glr-docs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'glr-docs');

create policy "Broker delete glr-docs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'glr-docs');

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index if not exists leads_agent_id_idx on leads(agent_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists messages_agent_id_idx on messages(agent_id);
create index if not exists messages_created_at_idx on messages(created_at);
create index if not exists documents_status_idx on documents(status);
