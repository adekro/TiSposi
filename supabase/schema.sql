create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id) on delete cascade,
  public_id text not null unique,
  title text not null,
  spouses text not null,
  storage_provider text not null check (storage_provider in ('google_drive', 'supabase_db')),
  google_drive_folder_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  type text not null check (type in ('photo', 'dedica')),
  text_content text,
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