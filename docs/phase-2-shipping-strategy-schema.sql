-- Phase 2 Shipping Strategy Expansion
-- Goal:
-- 1. Support customer-friendly shipping strategies now
-- 2. Make `base_incremental` the preferred near-term model
-- 3. Keep the schema ready for weight-based upgrades later

begin;

-- ---------------------------------------------------------------------------
-- Brand-level shipping strategy defaults
-- ---------------------------------------------------------------------------

alter table public.shipping_configurations
add column if not exists default_shipping_strategy text not null default 'base_incremental';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shipping_configurations_default_shipping_strategy_check'
  ) then
    alter table public.shipping_configurations
    add constraint shipping_configurations_default_shipping_strategy_check
    check (
      default_shipping_strategy in (
        'flat',
        'base_incremental',
        'weight_based',
        'weight_or_volumetric'
      )
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Brand-level delivery rules
-- ---------------------------------------------------------------------------

alter table public.shipping_method_delivery
add column if not exists calculation_strategy text not null default 'base_incremental',
add column if not exists additional_item_fee numeric(12, 2),
add column if not exists minimum_charge numeric(12, 2),
add column if not exists base_weight_kg numeric(12, 3),
add column if not exists fee_per_additional_kg numeric(12, 2),
add column if not exists volumetric_divisor numeric(12, 2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shipping_method_delivery_calculation_strategy_check'
  ) then
    alter table public.shipping_method_delivery
    add constraint shipping_method_delivery_calculation_strategy_check
    check (
      calculation_strategy in (
        'flat',
        'base_incremental',
        'weight_based',
        'weight_or_volumetric'
      )
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Product-level shipping container
-- ---------------------------------------------------------------------------

alter table public.product_shipping_details
add column if not exists weight_unit text not null default 'kg',
add column if not exists shipping_strategy text not null default 'base_incremental',
add column if not exists uses_brand_shipping_strategy boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_details_weight_unit_check'
  ) then
    alter table public.product_shipping_details
    add constraint product_shipping_details_weight_unit_check
    check (weight_unit in ('kg', 'g', 'lb'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_details_shipping_strategy_check'
  ) then
    alter table public.product_shipping_details
    add constraint product_shipping_details_shipping_strategy_check
    check (
      shipping_strategy in (
        'flat',
        'base_incremental',
        'weight_based',
        'weight_or_volumetric'
      )
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Product-level delivery rules
-- ---------------------------------------------------------------------------

alter table public.product_shipping_fees
add column if not exists calculation_strategy text not null default 'base_incremental',
add column if not exists additional_item_fee numeric(12, 2),
add column if not exists minimum_charge numeric(12, 2),
add column if not exists base_weight_kg numeric(12, 3),
add column if not exists fee_per_additional_kg numeric(12, 2),
add column if not exists volumetric_divisor numeric(12, 2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_fees_calculation_strategy_check'
  ) then
    alter table public.product_shipping_fees
    add constraint product_shipping_fees_calculation_strategy_check
    check (
      calculation_strategy in (
        'flat',
        'base_incremental',
        'weight_based',
        'weight_or_volumetric'
      )
    );
  end if;
end $$;

commit;
