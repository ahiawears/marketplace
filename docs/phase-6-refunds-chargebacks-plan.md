# Phase 6 Refund And Chargeback Tracking Plan

## Goal

This marketplace should be able to:

1. record refunds cleanly
2. record chargebacks and disputes cleanly
3. stop or reverse vendor settlement when money is clawed back
4. keep an auditable history of what happened and why

## Recommended Model

Do not try to overload `orders`, `brand_orders`, or `order_payments` with every refund and dispute event.

Keep those as the commercial state, then add dedicated event tables for money moving backward.

## Recommended New Tables

### 1. `refund_events`

One row per refund action.

Recommended fields:

- `id`
- `order_id`
- `brand_order_id` nullable for full-order refunds
- `order_item_id` nullable for item-level refunds
- `order_payment_id`
- `flutterwave_transaction_id`
- `refund_reference`
- `refund_scope`
  - `full_order`
  - `brand_order`
  - `item`
- `refund_status`
  - `pending`
  - `processed`
  - `failed`
- `refund_reason`
- `refund_amount_base`
- `refund_amount_customer_currency`
- `customer_currency`
- `exchange_rate_used`
- `notes`
- `requested_by`
  - `customer`
  - `brand`
  - `admin`
  - `system`
- `processed_at`
- `created_at`

### 2. `chargeback_events`

One row per dispute or chargeback event from Flutterwave/payment operations.

Recommended fields:

- `id`
- `order_id`
- `brand_order_id` nullable
- `order_payment_id`
- `flutterwave_transaction_id`
- `chargeback_reference`
- `event_type`
  - `dispute_opened`
  - `evidence_required`
  - `dispute_won`
  - `dispute_lost`
  - `chargeback`
  - `chargeback_reversed`
- `status`
  - `open`
  - `under_review`
  - `won`
  - `lost`
  - `closed`
- `amount_base`
- `amount_customer_currency`
- `customer_currency`
- `exchange_rate_used`
- `reason`
- `raw_gateway_payload`
- `received_at`
- `resolved_at`
- `created_at`

### 3. `brand_order_settlement_events`

This is the audit trail for held/released/withheld settlement state.

Recommended fields:

- `id`
- `brand_order_id`
- `event_type`
  - `hold_created`
  - `eligible_for_release`
  - `payout_released`
  - `payout_failed`
  - `refund_hold`
  - `chargeback_hold`
  - `settlement_reduced`
  - `settlement_reversed`
- `previous_status`
- `next_status`
- `amount_base`
- `amount_customer_currency`
- `notes`
- `reference`
- `created_at`

## How Refunds Should Work

### Full order refund

1. verify the order and payment exist
2. decide whether the refund is full or partial
3. create a `refund_events` row
4. update:
   - `orders.payment_status`
   - `brand_orders.settlement_status`
   - `order_items.status`
5. if vendor funds are still held:
   - reduce `vendor_payable_*`
   - keep payout unreleased
6. if vendor funds were already released:
   - mark the vendor order as `withheld` or `refunded`
   - flag it for payout recovery / offset

### Partial vendor refund

1. target the affected `brand_order`
2. allocate refund down to affected `order_items`
3. reduce:
   - `brand_orders.vendor_payable_base`
   - `brand_orders.vendor_payable_customer_currency`
4. write `refund_events`
5. write `brand_order_settlement_events`

### Item-level refund

1. target the affected `order_item`
2. reduce line totals and vendor payable
3. decide whether shipping is refundable too
4. write `refund_events`
5. update item and brand-order statuses

## How Chargebacks Should Work

Chargebacks are platform-risk events first.

That means:

1. create a `chargeback_events` row as soon as the gateway/webhook reports it
2. mark affected `brand_orders` as:
   - `withheld`
   - or another blocked settlement state if payout has not happened yet
3. if payout was already released:
   - create a settlement recovery entry in `brand_order_settlement_events`
   - mark the brand order for offset against future payout

## Settlement Rules During Refunds And Chargebacks

### If funds are still held

Best case.

- reduce or cancel vendor payable before release
- no recovery step needed

### If funds are already released

You need a recovery path.

Recommended options:

1. subtract from next payout
2. mark vendor balance negative until recovered
3. escalate to manual finance review if the balance cannot be recovered automatically

## Recommended Status Effects

### `orders.payment_status`

Add or use:

- `paid`
- `partially_refunded`
- `refunded`
- `chargeback`

### `brand_orders.settlement_status`

Current statuses already support part of this. Recommended usage:

- `held`
- `eligible_for_release`
- `released`
- `withheld`
- `refunded`

## Webhook Requirements

Refund and dispute tracking should not rely only on manual admin actions.

Use webhook reconciliation to:

1. record dispute/chargeback notifications
2. record refund confirmations
3. update settlement state automatically

## Order Snapshot Rules

Never recalculate old refund or dispute amounts from current rates.

Always store:

- base amount
- customer-currency amount
- exchange rate used
- raw gateway reference

## Recommended Build Order

1. create `brand_order_settlement_events`
2. create `refund_events`
3. create `chargeback_events`
4. wire refund write path
5. wire chargeback/dispute webhook write path
6. add payout-offset recovery logic
7. surface refund/dispute history in dashboard payouts and orders

## Minimum Production Standard

Before calling this area production-ready, you should have:

- refund event records
- chargeback/dispute event records
- settlement audit history
- vendor payable reduction rules
- payout hold/recovery rules
- webhook ingestion for dispute/refund events
