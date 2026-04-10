alter table public.customer_addresses
  add column if not exists address_note text;

alter table public.billing_details
  add column if not exists address_note text;
