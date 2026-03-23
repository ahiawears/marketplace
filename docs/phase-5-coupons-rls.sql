-- Phase 5 Coupon RLS Baseline
-- Run this in Supabase SQL editor.
-- This file assumes:
--   - brands are authenticated with auth.uid() = coupons.brand_id
--   - customers are authenticated with auth.uid() = users.id
--   - coupon usage writes happen through secure server-side order/coupon logic

begin;

-- ---------------------------------------------------------------------------
-- Schema tidy-up and supporting indexes
-- ---------------------------------------------------------------------------

alter table public.coupons
add column if not exists currency_code text;

create index if not exists coupons_brand_id_idx
on public.coupons (brand_id);

create index if not exists coupons_active_window_idx
on public.coupons (is_active, start_date, end_date);

create index if not exists coupons_code_idx
on public.coupons (code);

create index if not exists coupon_products_coupon_id_idx
on public.coupon_products (coupon_id);

create index if not exists coupon_products_product_id_idx
on public.coupon_products (product_id);

create index if not exists coupon_categories_coupon_id_idx
on public.coupon_categories (coupon_id);

create index if not exists coupon_categories_category_id_idx
on public.coupon_categories (category_id);

create index if not exists coupon_countries_coupon_id_idx
on public.coupon_countries (coupon_id);

create index if not exists coupon_usage_coupon_id_idx
on public.coupon_usage (coupon_id);

create index if not exists coupon_usage_customer_id_idx
on public.coupon_usage (customer_id);

create index if not exists coupon_usage_order_id_idx
on public.coupon_usage (order_id);

create unique index if not exists coupon_products_coupon_product_unique_idx
on public.coupon_products (coupon_id, product_id)
where coupon_id is not null and product_id is not null;

create unique index if not exists coupon_categories_coupon_category_unique_idx
on public.coupon_categories (coupon_id, category_id)
where coupon_id is not null and category_id is not null;

create unique index if not exists coupon_countries_coupon_country_unique_idx
on public.coupon_countries (coupon_id, country_code)
where coupon_id is not null and country_code is not null;

create unique index if not exists coupon_usage_coupon_order_unique_idx
on public.coupon_usage (coupon_id, order_id)
where coupon_id is not null;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.coupons enable row level security;
alter table public.coupon_products enable row level security;
alter table public.coupon_categories enable row level security;
alter table public.coupon_countries enable row level security;
alter table public.coupon_usage enable row level security;

-- ---------------------------------------------------------------------------
-- Clean out old policies first
-- ---------------------------------------------------------------------------

drop policy if exists "Brands can view own coupons" on public.coupons;
drop policy if exists "Brands can create own coupons" on public.coupons;
drop policy if exists "Brands can update own coupons" on public.coupons;
drop policy if exists "Brands can delete own coupons" on public.coupons;

drop policy if exists "Brands can view own coupon products" on public.coupon_products;
drop policy if exists "Brands can create own coupon products" on public.coupon_products;
drop policy if exists "Brands can delete own coupon products" on public.coupon_products;

drop policy if exists "Brands can view own coupon categories" on public.coupon_categories;
drop policy if exists "Brands can create own coupon categories" on public.coupon_categories;
drop policy if exists "Brands can delete own coupon categories" on public.coupon_categories;

drop policy if exists "Brands can view own coupon countries" on public.coupon_countries;
drop policy if exists "Brands can create own coupon countries" on public.coupon_countries;
drop policy if exists "Brands can delete own coupon countries" on public.coupon_countries;

drop policy if exists "Brands can view own coupon usage" on public.coupon_usage;
drop policy if exists "Customers can view own coupon usage" on public.coupon_usage;

-- ---------------------------------------------------------------------------
-- coupons
-- Brand-owned CRUD only
-- ---------------------------------------------------------------------------

create policy "Brands can view own coupons"
on public.coupons
for select
to authenticated
using (
  brand_id = auth.uid()
);

create policy "Brands can create own coupons"
on public.coupons
for insert
to authenticated
with check (
  brand_id = auth.uid()
);

create policy "Brands can update own coupons"
on public.coupons
for update
to authenticated
using (
  brand_id = auth.uid()
)
with check (
  brand_id = auth.uid()
);

create policy "Brands can delete own coupons"
on public.coupons
for delete
to authenticated
using (
  brand_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- coupon_products
-- Brands can manage only product links for their own coupons
-- ---------------------------------------------------------------------------

create policy "Brands can view own coupon products"
on public.coupon_products
for select
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_products.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can create own coupon products"
on public.coupon_products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_products.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can delete own coupon products"
on public.coupon_products
for delete
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_products.coupon_id
      and c.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- coupon_categories
-- Brands can manage only category links for their own coupons
-- ---------------------------------------------------------------------------

create policy "Brands can view own coupon categories"
on public.coupon_categories
for select
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_categories.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can create own coupon categories"
on public.coupon_categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_categories.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can delete own coupon categories"
on public.coupon_categories
for delete
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_categories.coupon_id
      and c.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- coupon_countries
-- Brands can manage only country links for their own coupons
-- ---------------------------------------------------------------------------

create policy "Brands can view own coupon countries"
on public.coupon_countries
for select
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_countries.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can create own coupon countries"
on public.coupon_countries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_countries.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Brands can delete own coupon countries"
on public.coupon_countries
for delete
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_countries.coupon_id
      and c.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- coupon_usage
-- Read-only from the client side
-- Brands can view usage for their own coupons
-- Customers can view only their own usage rows
-- Writes remain server-controlled
-- ---------------------------------------------------------------------------

create policy "Brands can view own coupon usage"
on public.coupon_usage
for select
to authenticated
using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_usage.coupon_id
      and c.brand_id = auth.uid()
  )
);

create policy "Customers can view own coupon usage"
on public.coupon_usage
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = coupon_usage.customer_id
      and u.id = auth.uid()
  )
);

commit;
