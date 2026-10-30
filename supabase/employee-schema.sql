-- TX Ropers Construction — Employee Console schema
-- Paste into a NEW Supabase project: SQL Editor → New query → Run
-- Do not reuse the ACAC Supabase project.

create extension if not exists "pgcrypto";

create table if not exists public.employees (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text not null default '',
  role text not null check (role in ('employee', 'admin')) default 'employee',
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  note text not null default '',
  clock_in_lat double precision,
  clock_in_lng double precision,
  clock_in_accuracy_m double precision,
  clock_out_lat double precision,
  clock_out_lng double precision,
  clock_out_accuracy_m double precision,
  created_at timestamptz not null default now(),
  constraint time_entries_out_after_in check (clock_out is null or clock_out >= clock_in)
);

-- If you already created time_entries without GPS columns, run:
-- alter table public.time_entries
--   add column if not exists clock_in_lat double precision,
--   add column if not exists clock_in_lng double precision,
--   add column if not exists clock_in_accuracy_m double precision,
--   add column if not exists clock_out_lat double precision,
--   add column if not exists clock_out_lng double precision,
--   add column if not exists clock_out_accuracy_m double precision;

-- At most one open punch per employee
create unique index if not exists time_entries_one_open_per_employee
  on public.time_entries (employee_id)
  where clock_out is null;

create index if not exists time_entries_employee_clock_in
  on public.time_entries (employee_id, clock_in desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('announcement', 'sop', 'policy', 'other')) default 'announcement',
  title text not null,
  body text not null default '',
  published boolean not null default true,
  author_id uuid references public.employees (id) on delete set null,
  file_name text,
  file_mime text,
  file_size bigint,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you already ran an older schema without file columns:
-- alter table public.documents
--   add column if not exists file_name text,
--   add column if not exists file_mime text,
--   add column if not exists file_size bigint,
--   add column if not exists file_path text;

-- Circular geofences for jobsite / shop clock reminders
create table if not exists public.geofences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  lat double precision not null,
  lng double precision not null,
  radius_m integer not null check (radius_m >= 50 and radius_m <= 5000),
  active boolean not null default true,
  notify_enter boolean not null default true,
  notify_exit boolean not null default true,
  created_by uuid references public.employees (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you already ran an older schema without address:
-- alter table public.geofences add column if not exists address text not null default '';

create or replace function public.is_active_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.employees
    where id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.employees
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.handle_new_employee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.employees (id, email, full_name, phone, role, status)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_employee on auth.users;
create trigger on_auth_user_created_employee
  after insert on auth.users
  for each row execute procedure public.handle_new_employee();

create or replace function public.touch_document_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute procedure public.touch_document_updated_at();

create or replace function public.touch_geofence_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists geofences_set_updated_at on public.geofences;
create trigger geofences_set_updated_at
  before update on public.geofences
  for each row execute procedure public.touch_geofence_updated_at();

alter table public.employees enable row level security;
alter table public.time_entries enable row level security;
alter table public.documents enable row level security;
alter table public.geofences enable row level security;

-- Employees
create policy "Active employees read active roster"
  on public.employees for select
  using (public.is_active_employee() and (status = 'active' or public.is_admin() or id = auth.uid()));

create policy "Admins update employees"
  on public.employees for update
  using (public.is_admin())
  with check (public.is_admin());

-- Time entries
create policy "Employees read own punches; admins read all"
  on public.time_entries for select
  using (public.is_active_employee() and (employee_id = auth.uid() or public.is_admin()));

create policy "Employees insert own clock-in"
  on public.time_entries for insert
  with check (public.is_active_employee() and employee_id = auth.uid());

create policy "Employees close own open punch; admins can edit"
  on public.time_entries for update
  using (public.is_active_employee() and (employee_id = auth.uid() or public.is_admin()))
  with check (public.is_active_employee() and (employee_id = auth.uid() or public.is_admin()));

-- Documents
create policy "Active employees read published docs; admins read all"
  on public.documents for select
  using (public.is_active_employee() and (published = true or public.is_admin()));

create policy "Admins insert documents"
  on public.documents for insert
  with check (public.is_admin());

create policy "Admins update documents"
  on public.documents for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete documents"
  on public.documents for delete
  using (public.is_admin());

-- Geofences: crew reads active fences; admins manage all
create policy "Active employees read geofences"
  on public.geofences for select
  using (public.is_active_employee() and (active = true or public.is_admin()));

create policy "Admins insert geofences"
  on public.geofences for insert
  with check (public.is_admin());

create policy "Admins update geofences"
  on public.geofences for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete geofences"
  on public.geofences for delete
  using (public.is_admin());

-- Invites so admins can onboard crew without the Supabase dashboard
create table if not exists public.employee_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  phone text not null default '',
  role text not null check (role in ('employee', 'admin')) default 'employee',
  token text not null unique,
  created_by uuid references public.employees (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz
);

create index if not exists employee_invites_token_idx
  on public.employee_invites (token);

alter table public.employee_invites enable row level security;

create policy "Admins manage invites"
  on public.employee_invites for all
  using (public.is_admin())
  with check (public.is_admin());

-- Join page needs to read/accept an invite by secret token before sign-in
create policy "Anyone can read open invite by token"
  on public.employee_invites for select
  using (accepted_at is null and expires_at > now());

create policy "Anyone can accept open invite"
  on public.employee_invites for update
  using (accepted_at is null and expires_at > now())
  with check (accepted_at is not null);

-- Private storage for attached SOP / policy files
insert into storage.buckets (id, name, public)
values ('employee-docs', 'employee-docs', false)
on conflict (id) do nothing;

create policy "Active employees read employee-docs"
  on storage.objects for select
  using (
    bucket_id = 'employee-docs'
    and public.is_active_employee()
  );

create policy "Admins upload employee-docs"
  on storage.objects for insert
  with check (
    bucket_id = 'employee-docs'
    and public.is_admin()
  );

create policy "Admins update employee-docs"
  on storage.objects for update
  using (
    bucket_id = 'employee-docs'
    and public.is_admin()
  )
  with check (
    bucket_id = 'employee-docs'
    and public.is_admin()
  );

create policy "Admins delete employee-docs"
  on storage.objects for delete
  using (
    bucket_id = 'employee-docs'
    and public.is_admin()
  );

-- After creating your first Auth user in Supabase Dashboard, promote them:
-- update public.employees set role = 'admin' where email = 'you@txropersconstruction.com';
