-- If you already ran the earlier schema, run this upgrade in Supabase SQL Editor.

alter table public.profiles add column if not exists years_in_business text not null default '';
alter table public.profiles add column if not exists service_area text not null default '';
alter table public.profiles add column if not exists website text not null default '';
alter table public.profiles add column if not exists insurance_notes text not null default '';
alter table public.profiles add column if not exists license_notes text not null default '';
alter table public.profiles add column if not exists about_work text not null default '';
alter table public.profiles add column if not exists "references" jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists work_photos jsonb not null default '[]'::jsonb;
