create extension if not exists "pgcrypto";

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  website_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.countries(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  unique (country_id, slug)
);

create table if not exists public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category_slug text
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  product_type_id uuid references public.product_types(id) on delete set null,
  country_id uuid references public.countries(id) on delete set null,
  region_id uuid references public.regions(id) on delete set null,
  name text not null,
  slug text not null unique,
  subtitle text,
  sku text unique,
  barcode text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  currency text not null default 'THB',
  stock_qty integer not null default 0,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  bottle_size_ml integer,
  alcohol_percent numeric(5,2),
  short_description text,
  full_description text,
  rating_avg numeric(3,2) default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 1,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  spec_key text not null,
  spec_label text not null,
  spec_value text not null,
  sort_order integer not null default 1
);

create table if not exists public.product_content_sections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  content text not null,
  sort_order integer not null default 1
);

create table if not exists public.product_awards (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  award_title text not null,
  award_year integer,
  award_org text,
  sort_order integer not null default 1
);

create table if not exists public.product_recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  image_url text,
  instructions text,
  sort_order integer not null default 1
);

create table if not exists public.product_recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.product_recipes(id) on delete cascade,
  item_text text not null,
  sort_order integer not null default 1
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id text references public."user"(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  review_title text,
  review_body text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_regions_country on public.regions(country_id);
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_type on public.products(product_type_id);
create index if not exists idx_products_country on public.products(country_id);
create index if not exists idx_products_region on public.products(region_id);
create index if not exists idx_products_active on public.products(is_active, is_featured);
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_product_specs_product on public.product_specs(product_id);
create index if not exists idx_product_sections_product on public.product_content_sections(product_id);
create index if not exists idx_product_awards_product on public.product_awards(product_id);
create index if not exists idx_product_recipes_product on public.product_recipes(product_id);

create or replace function public.set_catalog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_catalog_updated_at();

insert into public.categories (name, slug, parent_id, description, sort_order)
values
  ('Whisky', 'whisky', null, 'Whisky and whiskey from leading regions around the world', 1),
  ('Liqueur', 'liqueur', null, 'Sweetened and flavored liqueurs for sipping and mixing', 2),
  ('Spirits', 'spirits', null, 'Vodka, gin, rum, tequila and more', 3),
  ('Wine', 'wine', null, 'Still, sparkling and curated wine collections', 4),
  ('Thai Spirits', 'thai-spirits', null, 'Thai spirits and local favorites', 5),
  ('Bar Tools', 'bar-tools', null, 'Accessories, tools and barware essentials', 6),
  ('Other Products', 'other-products', null, 'Gift sets, mixers and specialty items', 7)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.categories (name, slug, parent_id, description, sort_order)
values
  ('Single Malt Whisky', 'single-malt-whisky', (select id from public.categories where slug = 'whisky'), 'Single malt whisky expressions', 11),
  ('Scotch Whisky', 'scotch-whisky', (select id from public.categories where slug = 'whisky'), 'Whisky distilled and matured in Scotland', 12),
  ('American Whiskey', 'american-whiskey', (select id from public.categories where slug = 'whisky'), 'American whiskey including bourbon and rye', 13),
  ('Irish Whiskey', 'irish-whiskey', (select id from public.categories where slug = 'whisky'), 'Smooth and approachable Irish whiskey', 14),
  ('Japanese Whisky', 'japanese-whisky', (select id from public.categories where slug = 'whisky'), 'Refined Japanese whisky collections', 15),
  ('Bourbon Whiskey', 'bourbon-whiskey', (select id from public.categories where slug = 'whisky'), 'Corn-led bourbon styles', 16),
  ('Blended Whisky', 'blended-whisky', (select id from public.categories where slug = 'whisky'), 'Balanced blended whisky expressions', 17)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.product_types (name, slug, category_slug)
values
  ('Single Malt Whisky', 'single-malt-whisky', 'whisky'),
  ('Scotch Whisky', 'scotch-whisky', 'whisky'),
  ('American Whiskey', 'american-whiskey', 'whisky'),
  ('Irish Whiskey', 'irish-whiskey', 'whisky'),
  ('Japanese Whisky', 'japanese-whisky', 'whisky'),
  ('Bourbon Whiskey', 'bourbon-whiskey', 'whisky'),
  ('Blended Whisky', 'blended-whisky', 'whisky'),
  ('Vodka', 'vodka', 'spirits'),
  ('Gin', 'gin', 'spirits'),
  ('Rum', 'rum', 'spirits'),
  ('Tequila', 'tequila', 'spirits'),
  ('Brandy', 'brandy', 'spirits'),
  ('Red Wine', 'red-wine', 'wine'),
  ('White Wine', 'white-wine', 'wine'),
  ('Sparkling Wine', 'sparkling-wine', 'wine'),
  ('Cocktail Liqueur', 'cocktail-liqueur', 'liqueur'),
  ('Bar Accessory', 'bar-accessory', 'bar-tools')
on conflict (slug) do update
set
  name = excluded.name,
  category_slug = excluded.category_slug;

insert into public.countries (name, code)
values
  ('Scotland', 'GB-SCT'),
  ('USA', 'US'),
  ('Ireland', 'IE'),
  ('Japan', 'JP'),
  ('Thailand', 'TH'),
  ('France', 'FR'),
  ('Italy', 'IT'),
  ('Mexico', 'MX')
on conflict (name) do update
set
  code = excluded.code;

insert into public.regions (country_id, name, slug, description)
values
  ((select id from public.countries where name = 'Scotland'), 'Speyside', 'speyside', 'Fruit-forward and elegant Scotch whisky region'),
  ((select id from public.countries where name = 'Scotland'), 'Highland', 'highland', 'Diverse Highland Scotch whisky region'),
  ((select id from public.countries where name = 'Scotland'), 'Lowland', 'lowland', 'Gentle and light Lowland Scotch whisky region'),
  ((select id from public.countries where name = 'Scotland'), 'Islay', 'islay', 'Smoky and maritime Scotch whisky region'),
  ((select id from public.countries where name = 'Scotland'), 'Island', 'island', 'Island Scotch whisky region with coastal character'),
  ((select id from public.countries where name = 'USA'), 'Kentucky', 'kentucky', 'Heartland of bourbon production'),
  ((select id from public.countries where name = 'Japan'), 'Hokkaido', 'hokkaido', 'Japanese whisky region')
on conflict (country_id, slug) do update
set
  name = excluded.name,
  description = excluded.description;
