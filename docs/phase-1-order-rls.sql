-- Phase 1 Order RLS Policies
-- Run this after phase-1-order-schema.sql

begin;

alter table public.orders enable row level security;
alter table public.brand_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payments enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_status enable row level security;

-- ---------------------------------------------------------------------------
-- orders: customers can read their own orders
-- ---------------------------------------------------------------------------

drop policy if exists "Customers can view own orders" on public.orders;
create policy "Customers can view own orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = orders.customer_id
      and u.id = auth.uid()
  )
);

-- Keep inserts/updates/deletes server-controlled for now.

-- ---------------------------------------------------------------------------
-- brand_orders: brands can read their own vendor orders
-- ---------------------------------------------------------------------------

drop policy if exists "Brands can view own brand orders" on public.brand_orders;
create policy "Brands can view own brand orders"
on public.brand_orders
for select
to authenticated
using (
  brand_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- order_items: customers can read items on their own orders
-- ---------------------------------------------------------------------------

drop policy if exists "Customers can view own order items" on public.order_items;
create policy "Customers can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.users u on u.id = o.customer_id
    where o.id = order_items.order_id
      and u.id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_items: brands can read items on their own brand orders
-- ---------------------------------------------------------------------------

drop policy if exists "Brands can view own order items" on public.order_items;
create policy "Brands can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.brand_orders bo
    where bo.id = order_items.brand_order_id
      and bo.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_payments: customers can read payment snapshots for their own orders
-- ---------------------------------------------------------------------------

drop policy if exists "Customers can view own order payments" on public.order_payments;
create policy "Customers can view own order payments"
on public.order_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.users u on u.id = o.customer_id
    where o.id = order_payments.order_id
      and u.id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_payments: brands can read payment snapshots for their own brand-linked orders
-- ---------------------------------------------------------------------------

drop policy if exists "Brands can view own order payments" on public.order_payments;
create policy "Brands can view own order payments"
on public.order_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.brand_orders bo on bo.order_id = o.id
    where o.id = order_payments.order_id
      and bo.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_status_history: customers can read history for their own orders
-- ---------------------------------------------------------------------------

drop policy if exists "Customers can view own order status history" on public.order_status_history;
create policy "Customers can view own order status history"
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.users u on u.id = o.customer_id
    where o.id = order_status_history.order_id
      and u.id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_status_history: brands can read history for their own vendor-linked orders
-- ---------------------------------------------------------------------------

drop policy if exists "Brands can view own order status history" on public.order_status_history;
create policy "Brands can view own order status history"
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.brand_orders bo on bo.order_id = o.id
    where o.id = order_status_history.order_id
      and bo.brand_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- order_status: read-only dictionary for authenticated users
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated users can view order statuses" on public.order_status;
create policy "Authenticated users can view order statuses"
on public.order_status
for select
to authenticated
using (true);

commit;
