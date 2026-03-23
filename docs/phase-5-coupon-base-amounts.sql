alter table public.coupons
add column if not exists base_currency_min_order_amount numeric;
