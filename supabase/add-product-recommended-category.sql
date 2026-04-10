alter table public.products
add column if not exists recommended_category text;

alter table public.products
drop constraint if exists products_recommended_category_check;

alter table public.products
add constraint products_recommended_category_check
check (
  recommended_category is null
  or recommended_category in (
    'best-sellers',
    'new-arrivals',
    'monthly-picks',
    'premium-selection',
    'gift-selection'
  )
);

create index if not exists idx_products_recommended_category
on public.products (recommended_category);

