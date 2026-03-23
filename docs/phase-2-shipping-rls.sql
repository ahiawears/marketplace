-- Phase 2 Shipping RLS Policies
-- Run this after phase-2-shipping-schema.sql

begin;

alter table public.shipping_configurations enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.shipping_method_delivery enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.zone_exclusions enable row level security;
alter table public.product_shipping_details enable row level security;
alter table public.product_shipping_fees enable row level security;

-- Optional related shipping tables used by the dashboard fetch path.
alter table public.free_shipping_rules enable row level security;
alter table public.same_day_applicable_cities enable row level security;

-- ---------------------------------------------------------------------------
-- shipping_configurations
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own shipping configurations" on public.shipping_configurations;
create policy "Brands manage own shipping configurations"
on public.shipping_configurations
for all
to authenticated
using (
  brand_id = auth.uid()
)
with check (
  brand_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- shipping_methods
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own shipping methods" on public.shipping_methods;
create policy "Brands manage own shipping methods"
on public.shipping_methods
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_methods.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_methods.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- shipping_method_delivery
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own shipping method delivery" on public.shipping_method_delivery;
create policy "Brands manage own shipping method delivery"
on public.shipping_method_delivery
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_method_delivery.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_method_delivery.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- shipping_zones
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own shipping zones" on public.shipping_zones;
create policy "Brands manage own shipping zones"
on public.shipping_zones
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_zones.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = shipping_zones.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- zone_exclusions
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own zone exclusions" on public.zone_exclusions;
create policy "Brands manage own zone exclusions"
on public.zone_exclusions
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = zone_exclusions.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = zone_exclusions.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- free_shipping_rules
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own free shipping rules" on public.free_shipping_rules;
create policy "Brands manage own free shipping rules"
on public.free_shipping_rules
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = free_shipping_rules.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = free_shipping_rules.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- same_day_applicable_cities
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own same day cities" on public.same_day_applicable_cities;
create policy "Brands manage own same day cities"
on public.same_day_applicable_cities
for all
to authenticated
using (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = same_day_applicable_cities.config_id
      and sc.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shipping_configurations sc
    where sc.id = same_day_applicable_cities.config_id
      and sc.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- product_shipping_details
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own product shipping details" on public.product_shipping_details;
create policy "Brands manage own product shipping details"
on public.product_shipping_details
for all
to authenticated
using (
  exists (
    select 1
    from public.products_list p
    where p.id = product_shipping_details.product_id
      and p.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products_list p
    where p.id = product_shipping_details.product_id
      and p.brand_id = auth.uid()
  )
);

drop policy if exists "Public can view published product shipping details" on public.product_shipping_details;
create policy "Public can view published product shipping details"
on public.product_shipping_details
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products_list p
    where p.id = product_shipping_details.product_id
      and p.is_published = true
      and (p.release_date is null or p.release_date <= now())
  )
);

-- ---------------------------------------------------------------------------
-- product_shipping_fees
-- ---------------------------------------------------------------------------

drop policy if exists "Brands manage own product shipping fees" on public.product_shipping_fees;
create policy "Brands manage own product shipping fees"
on public.product_shipping_fees
for all
to authenticated
using (
  exists (
    select 1
    from public.product_shipping_details psd
    join public.products_list p on p.id = psd.product_id
    where psd.id = product_shipping_fees.product_shipping_id
      and p.brand_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.product_shipping_details psd
    join public.products_list p on p.id = psd.product_id
    where psd.id = product_shipping_fees.product_shipping_id
      and p.brand_id = auth.uid()
  )
);

drop policy if exists "Public can view published product shipping fees" on public.product_shipping_fees;
create policy "Public can view published product shipping fees"
on public.product_shipping_fees
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_shipping_details psd
    join public.products_list p on p.id = psd.product_id
    where psd.id = product_shipping_fees.product_shipping_id
      and p.is_published = true
      and (p.release_date is null or p.release_date <= now())
  )
);

commit;
