alter table public.free_shipping_rules
add column if not exists currency_code text,
add column if not exists base_threshold numeric,
add column if not exists zone_type text;

alter table public.free_shipping_rules
drop constraint if exists free_shipping_rules_method_type_check;

alter table public.free_shipping_rules
add constraint free_shipping_rules_method_type_check check (
  method_type = any (array['standard'::text, 'express'::text])
);

alter table public.free_shipping_rules
drop constraint if exists free_shipping_rules_zone_type_check;

alter table public.free_shipping_rules
add constraint free_shipping_rules_zone_type_check check (
  zone_type is null
  or zone_type = any (array['domestic'::text, 'regional'::text, 'sub_regional'::text, 'global'::text])
);

create unique index if not exists free_shipping_rules_unique_idx
on public.free_shipping_rules (config_id, method_type, zone_type);
