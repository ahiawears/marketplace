# Shipping Future Todo

## Current Direction

- Primary strategy: `base_incremental`
- Brand shipping config acts as the default template
- Product shipping config acts as the customer-facing rule
- Shipping fees now store seller currency and base currency values

## Near-Term Next Improvements

- snapshot shipping strategy and shipping amounts on order creation
- surface shipping explanation more clearly at checkout
- backfill legacy shipping rows with `additional_item_fee` defaults
- add a `base_additional_item_fee` column so customer-side shipping totals never depend on runtime seller-currency conversion
- let checkout persist the selected shipping method and zone per brand order

## Recommended Business Rules

- first item in a brand group uses the base shipping fee
- each extra item in the same brand group uses the `additional_item_fee`
- same-day shipping should remain closer to flat pricing unless you explicitly want incremental same-day pricing
- if multiple shipping methods are available, checkout should calculate totals for the selected method, not just estimate one generic shipping number
- if a destination-specific shipping zone has no valid shared method across a vendor group, checkout should block purchase for that group instead of silently guessing a fallback

## Product Recommendations

- keep shipping product-level by default
- do not make shipping variant-level unless a variant materially changes package size, weight, or courier constraints
- keep brand-level config as the template and fallback only

## Future Strategy Upgrades

- add `weight_based` shipping calculation
- add `weight_or_volumetric` shipping calculation
- support per-zone minimum charge overrides
- support courier-specific shipping profiles
- support destination-aware shipping calculation in checkout

## Customer Experience Recommendations

- PDP should stay light and use the dialog pattern for shipping and returns details
- cart should show estimated shipping grouped by brand
- checkout should show final locked shipping totals before payment
- customers should understand when shipping is estimated versus finalized
- show the selected shipping method and delivery zone next to each vendor-group charge in checkout
- add a vendor-level shipping and returns summary on the post-order details page

## Operational Recommendations

- add shipping snapshots to `brand_orders` and `order_items`
- store the shipping strategy used on each order
- store the product shipping rule snapshot used on each order
- keep return-policy snapshots tied to the same vendor order
- later add shipment/tracking records at the `brand_orders` level
- eventually add a destination-resolution helper service so zone mapping is consistent between cart, checkout, order creation, and support tooling
