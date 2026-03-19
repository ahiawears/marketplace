# Today Pricing Tasks

## Build Order

1. `storefront display`
2. `cart`
3. `checkout`
4. `order records`

## Why This Order Works

- `storefront display` needs the correct converted pricing first
- `cart` should then use the same pricing model consistently
- `checkout` should lock the amount being charged
- `order records` should save the final charged values for history and audit

## Pricing Behavior Plan

### Storefront Display

- use `base_currency_price`
- convert to the selected customer currency using the latest daily `exchange_rates`
- show formatted currency consistently everywhere

### Cart

- also display converted price
- decide whether cart should store:
  - just the variant reference and recalculate live
  - or snapshot the converted unit price
- snapshotting is recommended by checkout time at the latest

### Checkout

- lock the price here
- store:
  - `unit_price_base`
  - `unit_price_customer_currency`
  - `customer_currency`
  - `exchange_rate_used`
- this prevents mid-session pricing drift

### Order Records

- always store the final transaction snapshot
- never rely on recalculating historical order totals from today's exchange rates
