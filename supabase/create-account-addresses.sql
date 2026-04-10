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

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  label text not null default 'Home' check (label in ('Home', 'Office', 'Warehouse', 'Other')),
  recipient_name text not null,
  phone_number text not null,
  address_line_1 text not null,
  address_line_2 text,
  address_note text,
  subdistrict text not null,
  district text not null,
  province text not null,
  postal_code text not null,
  delivery_note text,
  google_maps_url text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_default_shipping boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_user_id
  on public.customer_addresses(user_id);

create unique index if not exists idx_customer_addresses_default_shipping
  on public.customer_addresses(user_id)
  where is_default_shipping = true;

drop trigger if exists trg_customer_addresses_updated_at on public.customer_addresses;
create trigger trg_customer_addresses_updated_at
before update on public.customer_addresses
for each row
execute function public.set_updated_at();

create table if not exists public.billing_details (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public."user"(id) on delete cascade,
  billing_type text not null default 'individual' check (billing_type in ('individual', 'company')),
  full_name_or_company_name text not null,
  tax_id text,
  branch_type text not null default 'head_office' check (branch_type in ('head_office', 'branch_number')),
  branch_number text,
  billing_phone_number text not null,
  billing_email text,
  address_line_1 text not null,
  address_line_2 text,
  address_note text,
  subdistrict text not null,
  district text not null,
  province text not null,
  postal_code text not null,
  same_as_shipping boolean not null default false,
  source_address_id uuid references public.customer_addresses(id) on delete set null,
  google_maps_url text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_details_user_id
  on public.billing_details(user_id);

drop trigger if exists trg_billing_details_updated_at on public.billing_details;
create trigger trg_billing_details_updated_at
before update on public.billing_details
for each row
execute function public.set_updated_at();
