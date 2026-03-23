-- Phase 1 Order Schema Expansion
-- Run this in Supabase SQL editor.
-- This expands the current single-order model into a multi-vendor-ready structure
-- while preserving your existing tables: orders, brand_orders, order_items, order_payments.

begin;

-- ---------------------------------------------------------------------------
-- orders: parent order per checkout
-- ---------------------------------------------------------------------------

alter table public.orders
add column if not exists order_number text,
add column if not exists tx_ref text,
add column if not exists flw_ref text,
add column if not exists flutterwave_transaction_id text,
add column if not exists customer_currency text,
add column if not exists exchange_rate_used numeric,
add column if not exists subtotal_base numeric(12, 2),
add column if not exists subtotal_customer_currency numeric(12, 2),
add column if not exists shipping_total_base numeric(12, 2),
add column if not exists shipping_total_customer_currency numeric(12, 2),
add column if not exists discount_total_base numeric(12, 2),
add column if not exists discount_total_customer_currency numeric(12, 2),
add column if not exists grand_total_base numeric(12, 2),
add column if not exists grand_total_customer_currency numeric(12, 2),
add column if not exists billing_name text,
add column if not exists shipping_address_snapshot jsonb,
add column if not exists order_source text default 'web',
add column if not exists payment_verified_at timestamp with time zone;

update public.orders
set shipping_address_snapshot = shipping_address::jsonb
where shipping_address_snapshot is null;

create unique index if not exists orders_order_number_unique_idx
on public.orders (order_number)
where order_number is not null;

create unique index if not exists orders_tx_ref_unique_idx
on public.orders (tx_ref)
where tx_ref is not null;

create index if not exists orders_customer_id_idx
on public.orders (customer_id);

create index if not exists orders_flutterwave_transaction_id_idx
on public.orders (flutterwave_transaction_id);

create index if not exists orders_payment_status_idx
on public.orders (payment_status);

create index if not exists orders_status_idx
on public.orders (status);

-- ---------------------------------------------------------------------------
-- brand_orders: vendor-level order records
-- ---------------------------------------------------------------------------

alter table public.brand_orders
add column if not exists customer_currency text,
add column if not exists exchange_rate_used numeric,
add column if not exists subtotal_base numeric(12, 2),
add column if not exists subtotal_customer_currency numeric(12, 2),
add column if not exists shipping_fee_base numeric(12, 2),
add column if not exists shipping_fee_customer_currency numeric(12, 2),
add column if not exists discount_total_base numeric(12, 2),
add column if not exists discount_total_customer_currency numeric(12, 2),
add column if not exists commission_total_base numeric(12, 2),
add column if not exists commission_total_customer_currency numeric(12, 2),
add column if not exists vendor_payable_base numeric(12, 2),
add column if not exists vendor_payable_customer_currency numeric(12, 2),
add column if not exists settlement_status text not null default 'held',
add column if not exists held_until timestamp with time zone,
add column if not exists return_window_days integer,
add column if not exists return_window_ends_at timestamp with time zone,
add column if not exists payout_released_at timestamp with time zone,
add column if not exists payout_reference text,
add column if not exists flutterwave_subaccount_id text,
add column if not exists return_policy_snapshot jsonb,
add column if not exists shipping_rule_snapshot jsonb,
add column if not exists coupon_snapshot jsonb;

create index if not exists brand_orders_order_id_idx
on public.brand_orders (order_id);

create index if not exists brand_orders_brand_id_idx
on public.brand_orders (brand_id);

create index if not exists brand_orders_settlement_status_idx
on public.brand_orders (settlement_status);

create index if not exists brand_orders_return_window_ends_at_idx
on public.brand_orders (return_window_ends_at);

-- ---------------------------------------------------------------------------
-- order_items: purchased line items
-- ---------------------------------------------------------------------------

alter table public.order_items
add column if not exists brand_order_id uuid,
add column if not exists product_size_id uuid,
add column if not exists unit_price_base numeric(12, 2),
add column if not exists unit_price_customer_currency numeric(12, 2),
add column if not exists customer_currency text,
add column if not exists exchange_rate_used numeric,
add column if not exists product_name_snapshot text,
add column if not exists variant_name_snapshot text,
add column if not exists size_name_snapshot text,
add column if not exists image_url_snapshot text,
add column if not exists sku_snapshot text,
add column if not exists discount_amount_base numeric(12, 2),
add column if not exists discount_amount_customer_currency numeric(12, 2),
add column if not exists line_total_base numeric(12, 2),
add column if not exists line_total_customer_currency numeric(12, 2),
add column if not exists shipping_fee_base numeric(12, 2),
add column if not exists shipping_fee_customer_currency numeric(12, 2),
add column if not exists return_window_days_snapshot integer,
add column if not exists return_deadline_at timestamp with time zone,
add column if not exists coupon_snapshot jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_items_brand_order_id_fkey'
  ) then
    alter table public.order_items
    add constraint order_items_brand_order_id_fkey
    foreign key (brand_order_id) references public.brand_orders (id)
    on update cascade on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_items_product_size_id_fkey'
  ) then
    alter table public.order_items
    add constraint order_items_product_size_id_fkey
    foreign key (product_size_id) references public.product_sizes (id)
    on update cascade;
  end if;
end $$;

create index if not exists order_items_order_id_idx
on public.order_items (order_id);

create index if not exists order_items_brand_order_id_idx
on public.order_items (brand_order_id);

create index if not exists order_items_brand_id_idx
on public.order_items (brand_id);

create index if not exists order_items_product_id_idx
on public.order_items (product_id);

create index if not exists order_items_product_size_id_idx
on public.order_items (product_size_id);

-- ---------------------------------------------------------------------------
-- order_payments: payment snapshots / reconciliation data
-- ---------------------------------------------------------------------------

alter table public.order_payments
add column if not exists tx_ref text,
add column if not exists flw_ref text,
add column if not exists flutterwave_transaction_id text,
add column if not exists expected_amount numeric(12, 2),
add column if not exists verified_amount numeric(12, 2),
add column if not exists currency_code text,
add column if not exists exchange_rate_used numeric,
add column if not exists gateway_status text,
add column if not exists verification_status text,
add column if not exists raw_charge_response jsonb,
add column if not exists raw_verify_response jsonb,
add column if not exists processed_at timestamp with time zone;

create unique index if not exists order_payments_tx_ref_unique_idx
on public.order_payments (tx_ref)
where tx_ref is not null;

create unique index if not exists order_payments_flutterwave_transaction_id_unique_idx
on public.order_payments (flutterwave_transaction_id)
where flutterwave_transaction_id is not null;

create index if not exists order_payments_order_id_idx
on public.order_payments (order_id);

-- ---------------------------------------------------------------------------
-- order statuses: seed common values without duplicating existing rows
-- ---------------------------------------------------------------------------

insert into public.order_status (name)
values
  ('pending_payment'),
  ('paid'),
  ('processing'),
  ('partially_shipped'),
  ('shipped'),
  ('delivered'),
  ('return_requested'),
  ('return_in_transit'),
  ('returned'),
  ('cancelled'),
  ('refunded')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- simple settlement status check
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'brand_orders_settlement_status_check'
  ) then
    alter table public.brand_orders
    add constraint brand_orders_settlement_status_check
    check (
      settlement_status in (
        'held',
        'eligible_for_release',
        'released',
        'partially_released',
        'withheld',
        'refunded'
      )
    );
  end if;
end $$;

commit;
