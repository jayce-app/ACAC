-- ACAC production schema
-- Paste into Supabase: SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text not null,
  company text not null,
  trade text not null default '',
  phone text not null default '',
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  role text not null check (role in ('member', 'admin')) default 'member',
  years_in_business text not null default '',
  service_area text not null default '',
  website text not null default '',
  insurance_notes text not null default '',
  license_notes text not null default '',
  about_work text not null default '',
  "references" jsonb not null default '[]'::jsonb,
  work_photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  trade_needed text not null,
  location text not null,
  details text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blacklist_entries (
  id uuid primary key default gen_random_uuid(),
  party_type text not null check (party_type in ('customer', 'contractor')),
  name text not null,
  company text not null default '',
  reason text not null,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  board_id text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, company, trade, phone, status, role,
    years_in_business, service_area, website, insurance_notes, license_notes, about_work,
    "references", work_photos
  )
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company', ''),
    coalesce(new.raw_user_meta_data->>'trade', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'pending',
    'member',
    coalesce(new.raw_user_meta_data->>'years_in_business', ''),
    coalesce(new.raw_user_meta_data->>'service_area', ''),
    coalesce(new.raw_user_meta_data->>'website', ''),
    coalesce(new.raw_user_meta_data->>'insurance_notes', ''),
    coalesce(new.raw_user_meta_data->>'license_notes', ''),
    coalesce(new.raw_user_meta_data->>'about_work', ''),
    '[]'::jsonb,
    '[]'::jsonb
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.bids enable row level security;
alter table public.blacklist_entries enable row level security;
alter table public.board_posts enable row level security;

-- Profiles
create policy "Public can read approved members"
  on public.profiles for select
  using (status = 'approved' and role = 'member');

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own limited fields"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Bids
create policy "Approved members read bids"
  on public.bids for select
  using (public.is_approved_member());

create policy "Approved members insert bids"
  on public.bids for insert
  with check (public.is_approved_member() and author_id = auth.uid());

-- Blacklist
create policy "Approved members read approved blacklist"
  on public.blacklist_entries for select
  using (
    public.is_admin()
    or (public.is_approved_member() and status = 'approved')
    or (public.is_approved_member() and reporter_id = auth.uid())
  );

create policy "Approved members submit blacklist"
  on public.blacklist_entries for insert
  with check (
    public.is_approved_member()
    and reporter_id = auth.uid()
    and status = 'pending'
  );

create policy "Admins update blacklist"
  on public.blacklist_entries for update
  using (public.is_admin())
  with check (public.is_admin());

-- Board posts
create policy "Approved members read posts"
  on public.board_posts for select
  using (public.is_approved_member());

create policy "Approved members insert posts"
  on public.board_posts for insert
  with check (public.is_approved_member() and author_id = auth.uid());
