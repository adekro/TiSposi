create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id) on delete cascade,
  public_id text not null unique,
  title text not null,
  spouses text not null,
  storage_provider text not null check (storage_provider in ('google_drive', 'supabase_db')),
  google_drive_folder_id text,
  -- Fase 1: wedding page fields
  wedding_date date,
  venue_name text,
  venue_address text,
  venue_maps_url text,
  dresscode text,
  schedule text,
  couple_story text,
  menu text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Migration: add Fase 1 columns if table already exists
alter table public.events add column if not exists wedding_date date;
alter table public.events add column if not exists venue_name text;
alter table public.events add column if not exists venue_address text;
alter table public.events add column if not exists venue_maps_url text;
alter table public.events add column if not exists dresscode text;
alter table public.events add column if not exists schedule text;
alter table public.events add column if not exists couple_story text;
alter table public.events add column if not exists menu text;

create table if not exists public.gallery_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  type text not null check (type in ('photo', 'dedica')),
  text_content text,
  author_name text,
  photo_base64 text,
  photo_mime_type text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint gallery_entries_payload_check check (
    (type = 'dedica' and text_content is not null and photo_base64 is null and photo_mime_type is null)
    or
    (type = 'photo' and text_content is null and photo_base64 is not null and photo_mime_type is not null)
  )
);

create index if not exists idx_gallery_entries_event_created_at
  on public.gallery_entries (event_id, created_at desc);

-- Migration: add Fase 5 column if table already exists
alter table public.gallery_entries add column if not exists author_name text;

alter table public.events enable row level security;
alter table public.gallery_entries enable row level security;

drop policy if exists "Owners can read own event" on public.events;
create policy "Owners can read own event"
  on public.events for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Owners can insert own event" on public.events;
create policy "Owners can insert own event"
  on public.events for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can update own event" on public.events;
create policy "Owners can update own event"
  on public.events for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can read own gallery entries" on public.gallery_entries;
create policy "Owners can read own gallery entries"
  on public.gallery_entries for select
  using (
    exists (
      select 1
      from public.events
      where events.id = gallery_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Owners can manage own gallery entries" on public.gallery_entries;
create policy "Owners can manage own gallery entries"
  on public.gallery_entries for all
  using (
    exists (
      select 1
      from public.events
      where events.id = gallery_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.events
      where events.id = gallery_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- ── Fase 1: music requests ──────────────────────────────────────────────────
create table if not exists public.music_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  song text not null check (char_length(song) between 1 and 200),
  artist text check (artist is null or char_length(artist) <= 200),
  requested_by text check (requested_by is null or char_length(requested_by) <= 100),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_music_requests_event_id
  on public.music_requests (event_id, created_at desc);

alter table public.music_requests enable row level security;

drop policy if exists "Owners can read own music requests" on public.music_requests;
create policy "Owners can read own music requests"
  on public.music_requests for select
  using (
    exists (
      select 1 from public.events
      where events.id = music_requests.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- ── Fase 2: RSVP ────────────────────────────────────────────────────────────
create table if not exists public.rsvp_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 200),
  attending boolean not null,
  num_guests integer not null default 1 check (num_guests between 1 and 20),
  menu_choice text check (menu_choice is null or char_length(menu_choice) <= 200),
  dietary_restrictions text check (dietary_restrictions is null or char_length(dietary_restrictions) <= 1000),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_rsvp_entries_event_id
  on public.rsvp_entries (event_id, created_at desc);

alter table public.rsvp_entries enable row level security;

drop policy if exists "Owners can read own rsvp entries" on public.rsvp_entries;
create policy "Owners can read own rsvp entries"
  on public.rsvp_entries for select
  using (
    exists (
      select 1 from public.events
      where events.id = rsvp_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- ── Fase 3: Wedding Planning ─────────────────────────────────────────────────

-- Checklist
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  task text not null,
  due_label text,
  due_offset_days integer,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_checklist_items_event_id
  on public.checklist_items (event_id, due_offset_days nulls last);

alter table public.checklist_items enable row level security;

drop policy if exists "Owners can manage checklist" on public.checklist_items;
create policy "Owners can manage checklist"
  on public.checklist_items for all
  using (
    exists (
      select 1 from public.events
      where events.id = checklist_items.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = checklist_items.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- Guest list
create table if not exists public.guest_list (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text,
  phone text,
  table_number text,
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending', 'confirmed', 'declined')),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_guest_list_event_id
  on public.guest_list (event_id, full_name);

alter table public.guest_list enable row level security;

drop policy if exists "Owners can manage guest list" on public.guest_list;
create policy "Owners can manage guest list"
  on public.guest_list for all
  using (
    exists (
      select 1 from public.events
      where events.id = guest_list.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = guest_list.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- Budget items
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  category text not null,
  description text not null,
  estimated_amount numeric(10,2) not null default 0,
  actual_amount numeric(10,2) not null default 0,
  paid boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_budget_items_event_id
  on public.budget_items (event_id, category, created_at);

alter table public.budget_items enable row level security;

drop policy if exists "Owners can manage budget" on public.budget_items;
create policy "Owners can manage budget"
  on public.budget_items for all
  using (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- Suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  category text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  contract_status text not null default 'da_firmare' check (contract_status in ('da_firmare', 'firmato', 'non_necessario')),
  payment_status text not null default 'non_pagato' check (payment_status in ('non_pagato', 'acconto', 'saldo_pagato')),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_suppliers_event_id
  on public.suppliers (event_id, category, name);

alter table public.suppliers enable row level security;

drop policy if exists "Owners can manage suppliers" on public.suppliers;
create policy "Owners can manage suppliers"
  on public.suppliers for all
  using (
    exists (
      select 1 from public.events
      where events.id = suppliers.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = suppliers.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- ── Fase 4: Platform ─────────────────────────────────────────────────────────

alter table public.events add column if not exists visit_count integer not null default 0;

create or replace function public.increment_event_visits(p_event_id uuid)
returns void
language sql
security definer
as $$
  update public.events set visit_count = visit_count + 1 where id = p_event_id;
$$;