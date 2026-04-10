alter table public.customer_addresses
  add column if not exists google_maps_url text,
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7);

alter table public.billing_details
  add column if not exists google_maps_url text,
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7);
