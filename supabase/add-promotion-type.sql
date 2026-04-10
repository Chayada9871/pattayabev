alter table public.products
add column if not exists promotion_type text;

comment on column public.products.promotion_type is
'Stores a flexible promotion type such as DISCOUNT, BUY 1 GET 1, BUY MORE SAVE MORE, or any custom value entered by admin.';
