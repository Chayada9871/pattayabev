create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id text references public."user"(id) on delete set null,
  guest_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  subtotal numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  grand_total numeric(10,2) not null default 0,
  currency text not null default 'THB',
  delivery_method text not null,
  shipping_method text not null,
  payment_method text not null,
  order_status text not null default 'cart' check (order_status in ('cart', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired')),
  notes text,
  age_confirmed boolean not null default false,
  age_confirmation_accepted boolean not null default false,
  shipping_address_id uuid,
  billing_address_id uuid,
  gateway_provider text,
  gateway_session_id text,
  gateway_payment_id text,
  gateway_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1,
  subtotal numeric(10,2) not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'stripe',
  provider_name text not null default 'stripe',
  payment_method_type text,
  payment_reference text not null,
  transaction_ref text,
  payment_intent_id text,
  amount numeric(10,2) not null default 0,
  currency text not null default 'THB',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired')),
  raw_response jsonb not null default '{}'::jsonb,
  raw_webhook_json jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, provider_name, payment_reference)
);

create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  address_line_1 text not null,
  address_line_2 text,
  subdistrict text not null,
  district text not null,
  province text not null,
  postal_code text not null,
  google_maps_url text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  delivery_note text
);

create table if not exists public.billing_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  full_name text not null,
  address_line_1 text not null,
  address_line_2 text,
  subdistrict text not null,
  district text not null,
  province text not null,
  postal_code text not null,
  phone text,
  email text,
  company_name text,
  tax_id text,
  branch_info text,
  requires_tax_invoice boolean not null default false
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_shipping_address_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_shipping_address_id_fkey
      foreign key (shipping_address_id) references public.shipping_addresses(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_billing_address_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_billing_address_id_fkey
      foreign key (billing_address_id) references public.billing_addresses(id) on delete set null;
  end if;
end $$;

create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_gateway_session_id on public.orders(gateway_session_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_reference on public.payments(payment_reference);
create index if not exists idx_shipping_addresses_order_id on public.shipping_addresses(order_id);
create index if not exists idx_billing_addresses_order_id on public.billing_addresses(order_id);

create or replace function public.set_checkout_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_checkout_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row
execute function public.set_checkout_updated_at();

