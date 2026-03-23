-- Phase 5 Cart Coupon Persistence
-- Run this in Supabase SQL editor before enabling coupon application in cart/checkout.

begin;

create table if not exists public.cart_applied_coupons (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  cart_id uuid not null,
  coupon_id uuid not null,
  brand_id uuid not null,
  code text not null,
  applied_by_user_id uuid null,
  constraint cart_applied_coupons_pkey primary key (id),
  constraint cart_applied_coupons_cart_id_fkey foreign key (cart_id) references public.carts (id) on update cascade on delete cascade,
  constraint cart_applied_coupons_coupon_id_fkey foreign key (coupon_id) references public.coupons (id) on update cascade on delete cascade,
  constraint cart_applied_coupons_brand_id_fkey foreign key (brand_id) references public.brands_list (id) on update cascade on delete cascade,
  constraint cart_applied_coupons_applied_by_user_id_fkey foreign key (applied_by_user_id) references public.users (id) on update cascade on delete set null
) tablespace pg_default;

create unique index if not exists cart_applied_coupons_cart_brand_unique_idx
on public.cart_applied_coupons (cart_id, brand_id);

create unique index if not exists cart_applied_coupons_cart_coupon_unique_idx
on public.cart_applied_coupons (cart_id, coupon_id);

create index if not exists cart_applied_coupons_cart_id_idx
on public.cart_applied_coupons (cart_id);

create index if not exists cart_applied_coupons_coupon_id_idx
on public.cart_applied_coupons (coupon_id);

create index if not exists cart_applied_coupons_brand_id_idx
on public.cart_applied_coupons (brand_id);

alter table public.cart_applied_coupons enable row level security;

drop policy if exists "Customers can view own cart coupons" on public.cart_applied_coupons;
create policy "Customers can view own cart coupons"
on public.cart_applied_coupons
for select
to authenticated
using (
  exists (
    select 1
    from public.carts c
    join public.users u on u.id = c.user_id
    where c.id = cart_applied_coupons.cart_id
      and u.id = auth.uid()
  )
);

drop policy if exists "Customers can manage own cart coupons" on public.cart_applied_coupons;
create policy "Customers can manage own cart coupons"
on public.cart_applied_coupons
for all
to authenticated
using (
  exists (
    select 1
    from public.carts c
    join public.users u on u.id = c.user_id
    where c.id = cart_applied_coupons.cart_id
      and u.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.carts c
    join public.users u on u.id = c.user_id
    where c.id = cart_applied_coupons.cart_id
      and u.id = auth.uid()
  )
);

commit;
