create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public."user"(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  document_type text not null check (document_type in ('business_license', 'company_certificate', 'tax_document')),
  file_url text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default now(),
  unique (business_profile_id, document_type)
);

create index if not exists idx_business_profiles_user_id on public.business_profiles(user_id);
create index if not exists idx_business_documents_profile_id on public.business_documents(business_profile_id);

drop trigger if exists trg_business_profiles_updated_at on public.business_profiles;
create trigger trg_business_profiles_updated_at
before update on public.business_profiles
for each row
execute function public.set_updated_at();
