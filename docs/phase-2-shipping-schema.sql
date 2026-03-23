-- Phase 2 Shipping Schema Hardening
-- Goal:
-- 1. Keep product-level shipping as the customer-facing source of truth
-- 2. Keep brand-level shipping as the default template/fallback
-- 3. Store both seller-currency fee and base-currency fee for robust checkout math

begin;

-- ---------------------------------------------------------------------------
-- Brand-level shipping rules
-- ---------------------------------------------------------------------------

alter table public.shipping_method_delivery
add column if not exists currency_code text,
add column if not exists base_fee numeric(12, 2);

create index if not exists shipping_method_delivery_config_method_zone_idx
on public.shipping_method_delivery (config_id, method_type, zone_type);

-- ---------------------------------------------------------------------------
-- Product-level shipping rule container
-- ---------------------------------------------------------------------------

alter table public.product_shipping_details
add column if not exists uses_brand_shipping_config boolean not null default true,
add column if not exists brand_shipping_config_id uuid,
add column if not exists shipping_rule_source text not null default 'brand_default',
add column if not exists shipping_profile_snapshot jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_details_brand_shipping_config_id_fkey'
  ) then
    alter table public.product_shipping_details
    add constraint product_shipping_details_brand_shipping_config_id_fkey
    foreign key (brand_shipping_config_id) references public.shipping_configurations (id)
    on update cascade on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_details_shipping_rule_source_check'
  ) then
    alter table public.product_shipping_details
    add constraint product_shipping_details_shipping_rule_source_check
    check (shipping_rule_source in ('brand_default', 'product_override'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Product-level shipping fees
-- ---------------------------------------------------------------------------

alter table public.product_shipping_fees
add column if not exists currency_code text,
add column if not exists base_fee numeric(12, 2),
add column if not exists inherited_from_brand_config boolean not null default true,
add column if not exists source_delivery_rule_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_shipping_fees_source_delivery_rule_id_fkey'
  ) then
    alter table public.product_shipping_fees
    add constraint product_shipping_fees_source_delivery_rule_id_fkey
    foreign key (source_delivery_rule_id) references public.shipping_method_delivery (id)
    on update cascade on delete set null;
  end if;
end $$;

create unique index if not exists product_shipping_fees_unique_rule_idx
on public.product_shipping_fees (product_shipping_id, method_type, zone_type);

create index if not exists product_shipping_fees_product_rule_lookup_idx
on public.product_shipping_fees (product_shipping_id, method_type, zone_type, available);

commit;
