create extension if not exists "pgcrypto";

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  promotion_type text not null,
  description text,
  image_url text,
  link_url text,
  product_id uuid references public.products(id) on delete set null,
  discount_percent numeric(5,2),
  start_at timestamptz,
  end_at timestamptz,
  min_quantity integer,
  bundle_price numeric(10,2),
  fixed_price numeric(10,2),
  is_active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promotions add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.promotions add column if not exists discount_percent numeric(5,2);
alter table public.promotions add column if not exists start_at timestamptz;
alter table public.promotions add column if not exists end_at timestamptz;
alter table public.promotions add column if not exists min_quantity integer;
alter table public.promotions add column if not exists bundle_price numeric(10,2);
alter table public.promotions add column if not exists fixed_price numeric(10,2);

create index if not exists idx_promotions_active_sort on public.promotions(is_active, sort_order, created_at desc);
create index if not exists idx_promotions_product_id on public.promotions(product_id);

create or replace function public.set_promotions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at
before update on public.promotions
for each row
execute function public.set_promotions_updated_at();
