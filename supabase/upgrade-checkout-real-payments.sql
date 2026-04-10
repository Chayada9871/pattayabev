alter table public.orders
  add column if not exists grand_total numeric(10,2),
  add column if not exists shipping_method text,
  add column if not exists shipping_address_id uuid,
  add column if not exists billing_address_id uuid,
  add column if not exists gateway_provider text,
  add column if not exists gateway_session_id text,
  add column if not exists gateway_payment_id text,
  add column if not exists gateway_reference text,
  add column if not exists age_confirmation_accepted boolean;

update public.orders
set
  grand_total = coalesce(grand_total, total_amount, 0),
  shipping_method = coalesce(shipping_method, delivery_method, 'standard'),
  age_confirmation_accepted = coalesce(age_confirmation_accepted, age_confirmed, false)
where
  grand_total is null
  or shipping_method is null
  or age_confirmation_accepted is null;

alter table public.orders
  alter column grand_total set default 0,
  alter column grand_total set not null,
  alter column shipping_method set default 'standard',
  alter column shipping_method set not null,
  alter column age_confirmation_accepted set default false,
  alter column age_confirmation_accepted set not null;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired'));

alter table public.payments
  add column if not exists provider text,
  add column if not exists payment_method_type text,
  add column if not exists transaction_ref text,
  add column if not exists raw_webhook_json jsonb;

update public.payments
set
  provider = coalesce(provider, provider_name, 'stripe'),
  raw_webhook_json = coalesce(raw_webhook_json, raw_response, '{}'::jsonb)
where provider is null or raw_webhook_json is null;

alter table public.payments
  alter column provider set default 'stripe',
  alter column provider set not null,
  alter column raw_webhook_json set default '{}'::jsonb,
  alter column raw_webhook_json set not null;

alter table public.payments drop constraint if exists payments_payment_status_check;
alter table public.payments
  add constraint payments_payment_status_check
  check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired'));

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

create index if not exists idx_orders_gateway_session_id on public.orders(gateway_session_id);
create index if not exists idx_payments_reference on public.payments(payment_reference);

