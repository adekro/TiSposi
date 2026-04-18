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
  -- Fase 7: menu strutturato a portate
  menu_antipasto text,
  menu_primo text,
  menu_secondo text,
  menu_contorno text,
  menu_dolce text,
  menu_bevande text,
  -- Fase 8: info logistiche multi-luogo
  ceremony_venue_name text,
  ceremony_venue_address text,
  ceremony_venue_maps_url text,
  ceremony_time text,
  reception_venue_name text,
  reception_venue_address text,
  reception_venue_maps_url text,
  reception_time text,
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

-- Migration: Fase 7 - menu strutturato a portate
alter table public.events add column if not exists menu_antipasto text;
alter table public.events add column if not exists menu_primo text;
alter table public.events add column if not exists menu_secondo text;
alter table public.events add column if not exists menu_contorno text;
alter table public.events add column if not exists menu_dolce text;
alter table public.events add column if not exists menu_bevande text;

-- Migration: Fase 8 - info logistiche multi-luogo
alter table public.events add column if not exists ceremony_venue_name text;
alter table public.events add column if not exists ceremony_venue_address text;
alter table public.events add column if not exists ceremony_venue_maps_url text;
alter table public.events add column if not exists ceremony_time text;
alter table public.events add column if not exists reception_venue_name text;
alter table public.events add column if not exists reception_venue_address text;
alter table public.events add column if not exists reception_venue_maps_url text;
alter table public.events add column if not exists reception_time text;

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

-- Migration: Fase 6 - campo approvazione richieste musicali
alter table public.music_requests add column if not exists approved boolean not null default false;

create index if not exists idx_music_requests_event_approved
  on public.music_requests (event_id, approved, created_at asc);

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

-- Migration: Fase 14 - link RSVP personalizzato per invitato
alter table public.rsvp_entries
  add column if not exists guest_id uuid references public.guest_list (id) on delete set null;

-- Migration: Fase 13 - logistica ospiti nel RSVP
alter table public.rsvp_entries
  add column if not exists arrival_method text check (arrival_method in ('auto', 'treno', 'aereo', 'altro')),
  add column if not exists needs_parking boolean not null default false,
  add column if not exists needs_shuttle boolean not null default false,
  add column if not exists needs_accommodation boolean not null default false,
  add column if not exists accommodation_notes text;

create or replace function public.increment_event_visits(p_event_id uuid)
returns void
language sql
security definer
as $$
  update public.events set visit_count = visit_count + 1 where id = p_event_id;
$$;

-- ── Fase 11: Gestione tavoli ─────────────────────────────────────────────────
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  capacity integer check (capacity is null or capacity > 0),
  notes text,
  "order" integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_tables_event_id
  on public.tables (event_id, "order", name);

alter table public.tables enable row level security;

drop policy if exists "Owners can manage tables" on public.tables;
create policy "Owners can manage tables"
  on public.tables for all
  using (
    exists (
      select 1 from public.events
      where events.id = tables.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = tables.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- Migration: Fase 11 - FK tavolo su lista invitati (legacy, sostituita da table_assignments in Fase 17)
alter table public.guest_list
  add column if not exists table_id uuid references public.tables (id) on delete set null;

-- ── Fase 17: Assegnazione parziale ai tavoli (refactoring) ───────────────────
-- Sostituisce la FK diretta guest_list.table_id con una tabella junction.
-- Permette di distribuire i presenti di un invitato su più tavoli con quote diverse.

create table if not exists public.table_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  guest_id uuid not null references public.guest_list (id) on delete cascade,
  table_id uuid not null references public.tables (id) on delete cascade,
  num_seats integer not null default 1 check (num_seats > 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint table_assignments_guest_table_unique unique (guest_id, table_id)
);

create index if not exists idx_table_assignments_event_id
  on public.table_assignments (event_id, table_id, guest_id);

alter table public.table_assignments enable row level security;

drop policy if exists "Owners can manage table assignments" on public.table_assignments;
create policy "Owners can manage table assignments"
  on public.table_assignments for all
  using (
    exists (
      select 1 from public.events
      where events.id = table_assignments.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = table_assignments.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- Migration: copia assegnazioni esistenti da guest_list.table_id → table_assignments
-- Usa num_guests dall'RSVP dell'invitato (se presente e attending=true), altrimenti 1
insert into public.table_assignments (id, event_id, guest_id, table_id, num_seats)
select
  gen_random_uuid(),
  gl.event_id,
  gl.id,
  gl.table_id,
  coalesce(re.num_guests, 1)
from public.guest_list gl
left join public.rsvp_entries re
  on re.guest_id = gl.id
  and re.attending = true
where gl.table_id is not null
on conflict (guest_id, table_id) do nothing;

-- Migration: rimuovi colonna legacy (commentare se si vuole retrocompatibilità temporanea)
-- alter table public.guest_list drop column if exists table_id;

-- ── Fase 12: Attività e giochi ───────────────────────────────────────────────
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  materials text,
  "order" integer not null default 0,
  done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_activities_event_id
  on public.activities (event_id, "order", created_at);

alter table public.activities enable row level security;

drop policy if exists "Owners can manage activities" on public.activities;
create policy "Owners can manage activities"
  on public.activities for all
  using (
    exists (
      select 1 from public.events
      where events.id = activities.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = activities.event_id
        and events.owner_user_id = auth.uid()
    )
  );

-- ── Fase 16: Modifica RSVP dalla scheda invitati ─────────────────────────────
-- Aggiunge policy owner per INSERT e UPDATE su rsvp_entries (in precedenza solo SELECT)
drop policy if exists "Owners can manage rsvp entries" on public.rsvp_entries;
create policy "Owners can manage rsvp entries"
  on public.rsvp_entries for all
  using (
    exists (
      select 1 from public.events
      where events.id = rsvp_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events
      where events.id = rsvp_entries.event_id
        and events.owner_user_id = auth.uid()
    )
  );