# Multi-Vendor Order And Payment Flow

## Current State

- Checkout can now charge cards through the Flutterwave v3 direct charge flow.
- PIN and OTP authorization are working in the checkout path.
- Transaction verification is working.
- `brand_orders` already exists and should be expanded into the vendor-order layer instead of creating a totally separate replacement table.
- The current success payload:

```json
{
  "success": true,
  "status": "successful",
  "amount": 1370197.0999999999,
  "currency": "NGN"
}
```

confirms payment verification, but it does not yet create orders, allocate shipping, or track vendor settlement.

## Core Principle

This marketplace should charge the customer once per checkout, but internally split the purchase into vendor-level fulfillment and settlement records.

That means:

1. one customer payment attempt
2. one parent order
3. one vendor order per vendor represented in the cart
4. one order item per purchased variant-size line

## Working Todo List

Use this checklist as the implementation tracker for the current phase.

SQL for Phase 1 schema changes:

- [phase-1-order-schema.sql](/Users/apple/ahia/marketplace/docs/phase-1-order-schema.sql)
- [phase-1-order-rls.sql](/Users/apple/ahia/marketplace/docs/phase-1-order-rls.sql)
- [phase-2-shipping-schema.sql](/Users/apple/ahia/marketplace/docs/phase-2-shipping-schema.sql)
- [phase-2-shipping-rls.sql](/Users/apple/ahia/marketplace/docs/phase-2-shipping-rls.sql)
- [phase-2-shipping-strategy-schema.sql](/Users/apple/ahia/marketplace/docs/phase-2-shipping-strategy-schema.sql)
- [phase-5-coupons-rls.sql](/Users/apple/ahia/marketplace/docs/phase-5-coupons-rls.sql)
- [phase-5-cart-coupons.sql](/Users/apple/ahia/marketplace/docs/phase-5-cart-coupons.sql)
- [phase-6-refunds-chargebacks-plan.md](/Users/apple/ahia/marketplace/docs/phase-6-refunds-chargebacks-plan.md)
- [shipping-future-todo.md](/Users/apple/ahia/marketplace/docs/shipping-future-todo.md)

### Phase 1: Order Persistence

- [x] Audit and expand `orders`
- [x] Expand `brand_orders` into the real vendor-order layer
- [x] Expand `order_items` with pricing, size, and product snapshots
- [x] Expand `order_payments` into a proper payment snapshot table
- [x] Decide and store canonical order statuses
- [x] Create or update RLS/policies for customer and brand order access

### Phase 2: Shipping And Returns

- [x] Decide shipping model: brand default vs product override
- [x] Surface shipping fee/estimate on PDP
- [x] Surface grouped shipping totals in cart
- [x] Surface final shipping totals in checkout
- [x] Surface return policy on PDP
- [x] Surface return policy in cart and checkout
- [x] Prepare locked shipping and return snapshots in checkout data for order creation

### Phase 3: Verified Payment To Order Creation

- [x] Group cart items by brand after verified payment
- [x] Create parent `orders` row
- [x] Create one `brand_orders` row per brand
- [x] Create `order_items` rows from cart lines
- [x] Create `order_payments` snapshot row
- [x] Store locked shipping snapshots on brand order / order item creation
- [x] Store return-policy and return-window snapshots on brand order / order items
- [x] Clear cart only after successful order creation
- [x] Make order creation idempotent

### Phase 4: Held Funds And Settlement

- [x] Add held-funds fields to `brand_orders`
- [x] Track vendor payable amount separately from customer-paid amount
- [x] Track return-window end date per brand order
- [x] Prevent immediate vendor settlement
- [x] Add payout release workflow after return window expires
- [x] Add settlement status tracking

### Phase 5: Coupons

- [x] Add vendor-aware coupon application in cart
- [x] Allocate coupon discount only to the relevant brand order
- [x] Store coupon snapshots on the order data model
- [x] Reflect coupon effect in settlement calculations

### Phase 6: Production Hardening

- [x] Add webhook-based verification and reconciliation
- [x] Save raw Flutterwave charge/verify payload snapshots
- [x] Recheck or reserve stock before final order creation
- [x] Add failure recovery for payment-success/order-failure cases
- [x] Add refund and chargeback tracking plan

#### Recommended Hardening Order

1. Add webhook-based verification and reconciliation
2. Save raw Flutterwave charge/verify payload snapshots
3. Recheck or reserve stock before final order creation
4. Add failure recovery for payment-success/order-failure cases
5. Add refund and chargeback tracking plan

#### Why These Weren't Bundled Into Phase 3

- webhook reconciliation needs a stable public callback flow and should be layered on top of the new order-creation path, not mixed into the first write pass
- stock reservation is a business rule decision as much as a coding task because it changes when inventory becomes unavailable to other shoppers
- stronger failure recovery is easiest to do after the main order-creation path is stable and observable

#### Immediate Recommendation

- yes, we can do these now
- best next one: webhook-based verification and reconciliation
- after that: raw payload snapshots
- then: stock recheck or reservation

## Recommended End-To-End Flow

### 1. Cart Build

Customer adds items from one or more vendors.

Each cart line should already have:

- `product_id`
- `size_id` pointing to `product_sizes.id`
- quantity
- locked `unit_price_base`
- locked `unit_price_customer_currency`
- `customer_currency`
- `exchange_rate_used`
- product and size snapshot fields

### 2. Checkout Preparation

Before charging the card:

1. load the active cart
2. group cart items by `brand_id`
3. calculate per-vendor merchandise subtotal
4. calculate per-vendor shipping fee
5. allocate any discount per vendor
6. calculate commission per vendor
7. build one final checkout total for the customer

### 3. Customer Charge

Charge the customer once using the final total:

```text
grand_total_customer_currency =
sum(vendor merchandise subtotal in customer currency)
+ sum(vendor shipping fee in customer currency)
- sum(discounts in customer currency)
```

### 4. Verification

After Flutterwave returns success, verify the transaction server-side before giving value.

Flutterwave’s transaction verification guidance says to confirm:

- generated `tx_ref` matches
- status is `successful`
- currency matches expected
- amount paid is equal to or greater than expected

Sources:

- https://developer.flutterwave.com/docs/transaction-verification
- https://developer.flutterwave.com/v3.0.0/reference/verify-transaction

### 5. Order Creation

Only after successful verification:

1. create a parent order
2. create one vendor order per vendor group
3. create one order item per cart line
4. save payment snapshot data
5. save the vendor split instruction snapshot used for settlement
6. clear the cart

### 6. Post-Payment Reconciliation

After order creation:

- mark the payment attempt as processed
- keep reconciliation hooks for webhook retries
- keep settlement tracking separate from order creation

## Multi-Vendor Shipping

Yes, shipping should be calculated per vendor, not once for the whole cart.

Why:

- vendors may ship from different locations
- vendors may have different shipping rules
- vendor-specific shipping must be traceable on the final order

Recommended shipping model:

1. group cart items by vendor
2. calculate one shipping amount per vendor group
3. add those vendor shipping totals into the final charge

### Suggested Shipping Rules

Per vendor group, store:

- `vendor_merchandise_subtotal_base`
- `vendor_merchandise_subtotal_customer_currency`
- `vendor_shipping_fee_base`
- `vendor_shipping_fee_customer_currency`
- `vendor_discount_base`
- `vendor_discount_customer_currency`
- `vendor_grand_total_base`
- `vendor_grand_total_customer_currency`

### Example

If the cart contains:

- Vendor A items worth 100 USD
- Vendor A shipping 12 USD
- Vendor B items worth 60 USD
- Vendor B shipping 9 USD

Then:

```text
customer charge total = 100 + 12 + 60 + 9 = 181 USD
```

This total is then converted into the locked customer currency amount used for payment.

### Where Shipping Should Be Shown To Customers

Shipping should be visible in three places:

1. Product detail page
   - show the vendor shipping rule summary
   - show either:
     - a flat vendor shipping fee
     - a starting shipping fee
     - or a note that final shipping is calculated at checkout
2. Cart
   - show grouped vendor shipping estimates under each vendor group
   - show cart subtotal, shipping total, and grand total
3. Checkout
   - show final locked shipping fees per vendor group
   - show the grand total the customer will actually be charged

Recommended source of truth:

- brand shipping configuration set in the brand dashboard
- resolved into a vendor-level shipping quote at cart/checkout time

### Product Shipping Configuration Note

Because each product already has its own shipping configuration/fees, the best model is:

1. brand-level shipping settings act as defaults
2. product-level shipping configuration acts as the purchasable rule used for that item
3. checkout groups items by brand, but shipping is computed from the products inside each brand group

That means shipping should not be a single flat brand fee unless that is the explicit business rule.

Recommended handling:

- keep product-level shipping data as the primary source for charge calculation
- allow brand-level settings to provide defaults/fallbacks
- when multiple items from the same brand are in the cart, define a real cart shipping strategy instead of simply summing per-item fees

### Recommended Shipping Strategy

For this marketplace, the best production-ready approach is:

1. use `base + incremental` as the main shipping model now
2. keep the schema ready for `weight_based` or `weight_or_volumetric` later

Why:

- summing full per-product shipping fees is often too expensive and feels unfair
- `base + incremental` is easier to explain to customers
- `base + incremental` is easier to implement reliably than a full courier-rating engine
- weight and dimensions are still useful and should stay in the schema for the future upgrade path

### Shipping Strategy Options

#### 1. Flat

- one fee for the rule
- simple, but not ideal for multi-item fashion carts

#### 2. Base + Incremental

- first item uses the base fee
- each additional item adds a smaller incremental fee
- best near-term balance of fairness and implementation complexity

Example:

```text
standard domestic:
base fee = 8
additional item fee = 2

3 items from the same brand group:
8 + 2 + 2 = 12
```

#### 3. Weight Based

- charge from total package weight
- more accurate, but requires stronger packaging and zone rules

#### 4. Weight Or Volumetric

- calculate both actual weight and volumetric weight
- charge whichever is higher
- best long-term logistics model, but heavier to implement

### Recommended Business Decision

Use this progression:

1. now: `base_incremental`
2. later: upgrade selected brands/zones to `weight_based`
3. eventually: `weight_or_volumetric` if needed

### Current Temporary Fallback

The current cart estimate uses a temporary fallback:

- per product: lowest available shipping fee
- per brand group: highest of those item estimates

That was a safe stopgap to move the checkout flow forward, but it should be replaced by the strategy model above.

This merge rule must be decided once and then stored as a snapshot on the order.

## Return Policy Visibility And Hold Logic

Each vendor’s return policy should also be surfaced to the customer before payment.

### Where Return Policy Should Be Shown

1. Product detail page
   - show a short return summary
   - for example: `14-day returns`, `Final sale`, `Exchange only`
2. Cart
   - show vendor return summary per vendor group
3. Checkout
   - show the return window and return policy link/summary before the customer pays
4. Order confirmation and order details
   - store the return policy snapshot used at purchase time

### Important Settlement Decision

If you want to hold vendor funds until the return window passes, do not rely only on immediate Flutterwave split settlement.

Why:

- Flutterwave split payments settle to subaccounts based on settlement cycle
- that is different from platform-controlled delayed vendor release
- Flutterwave settlements happen on their own cycle, not on your return-policy timeline

Sources:

- https://developer.flutterwave.com/docs/split-payments
- https://developer.flutterwave.com/docs/settlements

### Best Model For This Marketplace

If your business rule is:

- customer pays now
- platform holds vendor funds until the return window expires
- platform releases vendor payout later

then the safer architecture is:

1. collect payment into the platform account
2. record what each vendor is owed in your own database
3. mark those funds as `held`
4. after the vendor return window passes, release payout through your payout flow

That means:

- subaccounts are still useful for vendor payout setup and tracking
- but settlement control should be platform-led in your own ledger
- if you later use Flutterwave split settlement directly, that would reduce your ability to hold vendor funds until your own release date

So for this project:

- businesses should not receive immediate settlements
- customer payment should be captured by the platform
- vendor payable balances should be marked as held until the relevant return window ends

### Escrow / Preauth Notes

Flutterwave has escrow and preauthorization related features, but they come with constraints:

- preauthorization is approval-gated and is meant for short holds
- the documented hold window is seven days
- that usually does not cover a full fashion return window

Source:

- https://developer.flutterwave.com/docs/preauthorization

So for fashion returns, platform-led held balances are the cleaner long-term model.

## Flutterwave Split Payments For Marketplace Settlement

Official Flutterwave split payments docs:

- https://developer.flutterwave.com/docs/split-payments
- https://developer.flutterwave.com/v3.0.0/docs/split-payments

Flutterwave’s current model is:

- create subaccounts for vendors
- pass a `subaccounts` array when charging
- Flutterwave settles based on the split rules configured

### What This Means For This Project

Each vendor should eventually have:

- payout account details
- a Flutterwave subaccount ID
- a settlement readiness state

At checkout, after grouping by vendor, build subaccount split instructions from the vendor groups.

### Recommended Settlement Rule

Use this default policy unless the business rules change:

- platform commission is calculated on merchandise, not shipping
- vendor shipping fee belongs fully to the vendor
- discounts reduce the vendor’s merchandise before settlement

Vendor settlement formula:

```text
vendor_settlement =
vendor merchandise subtotal
+ vendor shipping fee
- vendor discount allocation
- platform commission allocation
```

If you use platform-held payouts instead of immediate split settlement, this formula should still be stored on the order as the internal payable amount for each vendor.

### Split Strategy

Flutterwave supports:

- subaccount defaults with `split_type` and `split_value`
- per-transaction overrides
- `transaction_split_ratio` for multi-subaccount carts

For this marketplace, the cleaner pattern is:

1. maintain vendor subaccounts
2. calculate exact vendor-level settlement amounts at checkout
3. save those values in your own database
4. pass matching Flutterwave split instructions on the charge

### Important Flutterwave Notes

- Flutterwave warns that marketplace disputes and chargebacks are logged against your platform account.
- Split payment settlements also have fee and VAT implications.
- For NGN transactions above certain thresholds, stamp duty can affect settlement.

These are reasons to store your own settlement snapshot, not just rely on later recalculation.

Source:

- https://developer.flutterwave.com/docs/split-payments

## Recommended Data Model

### Parent Orders

One row per successful checkout.

Recommended fields:

- `id`
- `customer_id`
- `cart_id`
- `tx_ref`
- `flw_ref`
- `flutterwave_transaction_id`
- `payment_status`
- `order_status`
- `customer_currency`
- `exchange_rate_used`
- `subtotal_base`
- `subtotal_customer_currency`
- `shipping_total_base`
- `shipping_total_customer_currency`
- `discount_total_base`
- `discount_total_customer_currency`
- `grand_total_base`
- `grand_total_customer_currency`
- `shipping_address_snapshot`
- `billing_name`
- `created_at`

### Vendor Orders

One row per vendor group in a checkout.

Recommended fields:

- `id`
- `order_id`
- `brand_id`
- `flutterwave_subaccount_id_snapshot`
- `vendor_subtotal_base`
- `vendor_subtotal_customer_currency`
- `vendor_shipping_fee_base`
- `vendor_shipping_fee_customer_currency`
- `vendor_discount_base`
- `vendor_discount_customer_currency`
- `platform_commission_base`
- `platform_commission_customer_currency`
- `vendor_settlement_base`
- `vendor_settlement_customer_currency`
- `currency_code`
- `exchange_rate_used`
- `fulfillment_status`
- `settlement_status`
- `held_until`
- `return_window_ends_at`
- `return_policy_snapshot`

In this project, that layer should be built by expanding the existing `brand_orders` table rather than replacing it.

### Order Items

One row per purchased line item.

Recommended fields:

- `id`
- `vendor_order_id`
- `product_variant_id`
- `product_size_id`
- `quantity`
- `unit_price_base`
- `unit_price_customer_currency`
- `customer_currency`
- `exchange_rate_used`
- `product_name_snapshot`
- `variant_name_snapshot`
- `size_name_snapshot`
- `image_url_snapshot`
- `sku_snapshot`
- `line_total_base`
- `line_total_customer_currency`
- `return_window_days_snapshot`
- `return_deadline_at`

### Coupons / Promotions

Because each brand can create its own coupons, coupon handling must be vendor-aware too.

Recommended coupon rules:

1. A vendor coupon only applies to that vendor’s items
2. A vendor coupon should not reduce another vendor’s subtotal
3. Coupon discount should be stored at:
   - parent order level for total reporting
   - vendor order level for settlement accuracy
   - order item level if the discount is line-specific

Recommended coupon snapshot fields:

- `coupon_id`
- `coupon_code`
- `coupon_scope`
- `discount_type`
- `discount_value`
- `discount_amount_base`
- `discount_amount_customer_currency`

Where coupon effects should be shown:

1. Cart
   - under the relevant vendor group
2. Checkout
   - in the final locked totals
3. Order records
   - as snapshot values, not recalculated later

### Payment Attempts / Transactions

Either a dedicated table or fields on the order.

Recommended fields:

- `tx_ref`
- `flw_ref`
- `flutterwave_transaction_id`
- `status`
- `currency`
- `expected_amount`
- `verified_amount`
- raw request snapshot
- raw verify response snapshot
- processed_at

## Existing Tables: What Is Missing

### `orders`

Current gaps:

- missing `tx_ref`
- missing `flw_ref`
- missing Flutterwave transaction id
- missing currency snapshot fields
- missing subtotal / shipping / discount breakdown
- missing exchange-rate snapshot
- missing grand-total snapshot fields in both base and customer currency

### `brand_orders`

This is the right place for vendor-level order tracking, but it needs more fields.

Missing fields:

- vendor subtotal
- vendor shipping fee
- vendor discount amount
- platform commission amount
- vendor payable amount
- currency code
- exchange rate used
- settlement status
- held-until date
- return-window end date
- return policy snapshot

### `order_items`

Current gaps:

- should point to the purchased `product_sizes.id`
- needs unit price snapshots
- needs currency and exchange-rate snapshots
- needs product/variant/size/image snapshots
- needs line-total snapshots
- needs return-window snapshot

### `order_payments`

Current gaps:

- missing `tx_ref`
- missing `flw_ref`
- missing verified currency
- missing expected amount vs verified amount
- missing status detail
- missing raw gateway payload snapshot
- missing processed timestamp

### Other Missing Pieces

- idempotency key or unique payment-processing guard
- coupon allocation snapshots
- shipping rule snapshot
- vendor payout release records

## What To Add To Make This Production-Ready

### Must Add

1. Parent order table
2. Vendor order table
3. Order item table
4. Payment attempt or transaction snapshot table
5. Vendor-group shipping calculation in checkout
6. Vendor settlement and commission snapshot builder
7. Cart-to-order creation after successful verification
8. Vendor-aware coupon allocation
9. Return-policy snapshot storage
10. Held-balance / payout-release tracking

### Critical Hardening

1. Idempotent order creation
   - if verification or webhook hits twice, create orders only once
2. Inventory protection
   - reserve or recheck stock before final order creation
3. Webhook support
   - do not rely only on browser redirect
4. Webhook signature verification
   - Flutterwave recommends signature verification and idempotent processing
5. Reconciliation job
   - poll pending transactions as a backup if webhook delivery fails
6. Payment audit trail
   - store raw charge and verification payload snapshots
7. Failure recovery
   - if payment succeeds but order creation fails, log and retry safely
8. Refund model
   - support partial vendor-level refunds later
9. Chargeback/dispute handling
   - keep vendor/order mapping for support and liability tracking
10. Payout release workflow
   - release held vendor funds only after return window passes
11. Shipping quote traceability
   - store the rule and amount used at checkout

Sources:

- https://developer.flutterwave.com/docs/webhooks
- https://developer.flutterwave.com/v3.0.0/docs/webhooks

### Nice To Add

1. Vendor-specific delivery estimates
2. Vendor-level shipment records
3. Partial cancellation handling
4. Return tracking per vendor order
5. Settlement reconciliation dashboard

## Recommended Build Order

1. Create order tables
2. Create payment attempt / payment snapshot table
3. Group checkout cart items by vendor
4. Calculate per-vendor shipping totals
5. Apply vendor-aware coupons
6. Calculate per-vendor settlement and commission totals
7. Store return-policy and return-window snapshots
6. After verified payment, create:
   - parent order
   - vendor orders
   - order items
   - payment snapshot
8. Clear cart only after order creation succeeds
9. Add payout hold / release tracking
10. Add Flutterwave split instructions only if the business wants immediate settlement
11. Add webhook reconciliation and idempotent reprocessing

## Bottom Line

For this marketplace:

- yes, shipping should be charged per vendor group
- yes, shipping should be shown on PDP, cart, and checkout
- yes, each vendor’s return policy should be shown before payment
- yes, the cart must be internally split by vendor after payment
- yes, you need your own settlement snapshot even if Flutterwave performs the actual split
- if you want to hold funds until return windows expire, platform-led held balances are safer than immediate vendor split settlement
- yes, the order and settlement flow still needs a few production-hardening pieces before it is fully ready

The best next implementation step is:

1. finish Phase 2 shipping and returns
2. then wire cart-to-order creation after successful verification
