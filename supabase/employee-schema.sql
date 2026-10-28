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
  created_at timestamptz not null default now(),
  constraint time_entries_out_after_in check (clock_out is null or clock_out >= clock_in)
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

alter table public.employees enable row level security;
alter table public.time_entries enable row level security;
alter table public.documents enable row level security;

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

-- After creating your first Auth user in Supabase Dashboard, promote them:
-- update public.employees set role = 'admin' where email = 'you@txropersconstruction.com';
