# Customer-Facing Map

This file maps the current customer-facing side of the project, what exists today, what looks solid, what looks partial, and what should be built next.

## Honest Recommendation

You should **not** try to build the full customer-facing app and the full brand dashboard simultaneously all the way through.

That usually slows a project like this down because:
- both sides keep changing each other’s assumptions
- you end up polishing pages that have no real data behind them yet
- checkout/orders/messages/reviews become hard to test until the backend and dashboard rules are stable

The faster approach is:

1. build the **brand/dashboard operational backbone** until it is good enough
2. then build the customer side in **vertical commerce slices**
3. only after that, finish the customer-dependent dashboard pages like orders, messages, reviews, analytics

For this project specifically, the brand side is already much further along than the storefront, so finishing the operational core first is the right call.

## Current Customer-Facing Routes

### 1. Landing / Home

Route:
- `/`

Page:
- [app/(landing)/page.tsx](/Users/apple/ahia/marketplace/app/(landing)/page.tsx)

Current status:
- Strong visual shell
- Hero + CTA + category sections exist
- Product sections are still commented out

What it is good for:
- brand/story entry point
- marketing homepage

What is still needed:
- live featured products
- live featured brands
- stronger conversion path into products and brands

Priority:
- Medium

### 2. Products Listing

Route:
- `/products`

Page:
- [app/products/page.tsx](/Users/apple/ahia/marketplace/app/products/page.tsx)

Main UI:
- [components/ui/productsList.tsx](/Users/apple/ahia/marketplace/components/ui/productsList.tsx)

Current status:
- Real product fetching is wired
- likes/saved flow exists
- add-to-cart modal exists

Important issues:
- it still uses `img`, not `next/image`
- it navigates to `/product-detail/${id}`, but your actual product route is `/product/[id]`
- product list page still feels older than the newer dashboard work

Priority:
- High

### 3. Product Detail Page

Route:
- `/product/[id]`

Page:
- [app/product/[id]/page.tsx](/Users/apple/ahia/marketplace/app/product/[id]/page.tsx)

Main UI:
- [components/ui/product-item-detail.tsx](/Users/apple/ahia/marketplace/components/ui/product-item-detail.tsx)

Data:
- `getVariantById`
- `getSavedProductById`

Current status:
- real variant-based product detail page exists
- saved-state logic exists

Important issues:
- route typing is older/awkward
- if data is missing it returns an object instead of a proper `notFound()` or error page
- needs a full QA pass for variant switching and add-to-cart behavior

Priority:
- Very High

### 4. Brand Listing

Route:
- `/brands`

Page:
- [app/brands/page.tsx](/Users/apple/ahia/marketplace/app/brands/page.tsx)

Current status:
- real alphabetized brand browser exists
- decent browsing shell

Important issues:
- uses plain `<a>` instead of `Link`
- uses inline background image cards
- could use stronger loading/empty handling polish

Priority:
- Medium

### 5. Brand Profile Page

Route:
- `/brands/[brandId]`

Page:
- [app/brands/[brandId]/page.tsx](/Users/apple/ahia/marketplace/app/brands/[brandId]/page.tsx)

Current status:
- real brand details page exists
- social links exist
- brand product filtering exists
- product grid for a brand exists

Important issues:
- still strongly client-side
- uses plain `img`
- params handling is awkward
- needs a UX and performance cleanup pass

Priority:
- Medium

### 6. Cart

Route:
- `/cart`

Page:
- [app/cart/page.tsx](/Users/apple/ahia/marketplace/app/cart/page.tsx)

Current status:
- real server-side cart loading exists
- anonymous/user cart logic exists
- quantity updates and order summary exist

Important issues:
- page still contains a lot of old commented code
- needs a proper QA pass around anonymous cart merge and update/delete behavior

Priority:
- Very High

### 7. Place Order / Checkout

Route:
- `/place-order`

Page:
- [app/place-order/page.tsx](/Users/apple/ahia/marketplace/app/place-order/page.tsx)

Current status:
- not finished
- mostly shell code
- cart is fetched but almost no checkout UI is actually rendered

Priority:
- Critical

### 8. Payment Confirmation

Route:
- `/payment-confirmation`

Page:
- [app/payment-confirmation/page.tsx](/Users/apple/ahia/marketplace/app/payment-confirmation/page.tsx)

Current status:
- exists
- should be checked against the real payment flow

Priority:
- High after checkout is completed

### 9. Saved Lists

Route:
- `/saved-lists`

Page:
- [app/saved-lists/page.tsx](/Users/apple/ahia/marketplace/app/saved-lists/page.tsx)

Current status:
- real saved-items loading exists
- empty state exists

Priority:
- Medium

### 10. My Account

Route:
- `/my-account`

Page:
- [app/my-account/page.tsx](/Users/apple/ahia/marketplace/app/my-account/page.tsx)

Current status:
- auth check exists
- user details/address/payment methods are loaded

Important issues:
- depends on older account components in places
- needs a UX pass after checkout/account flows are stabilized

Priority:
- High

### 11. Auth Pages

Routes:
- `/log-in`
- `/signup`
- password reset / confirm email flows under `app/(auth)`

Current status:
- route structure exists
- should be validated as part of the full purchase/account journey

Priority:
- High

## What Looks Strongest Right Now

- cart foundation
- product detail foundation
- saved items foundation
- brand profile/storefront foundation

## What Looks Weakest Right Now

- checkout/place-order
- product listing route consistency
- full account flow cohesion
- route consistency between old and new customer components

## Customer-Facing To-Do List

### Critical

- Finish checkout on `/place-order`
- Make `/products` route consistent with `/product/[id]`
- Verify add-to-cart works end to end from listing and product detail
- Ensure payment confirmation route matches the real payment flow

### High

- Clean up product detail error handling and route typing
- QA cart for anonymous + signed-in users
- tighten account flow on `/my-account`
- verify saved-items flow end to end
- verify auth redirects and protected routes

### Medium

- improve homepage with real featured products and brands
- modernize `/brands` and `/brands/[brandId]`
- replace remaining older image/link patterns with consistent Next.js patterns

### Later

- customer orders UI
- customer messages
- review submission and review history

## Best Customer Build Order

If you want to move into the customer side after enough dashboard work is done, this is the best order:

1. `/products`
2. `/product/[id]`
3. `/cart`
4. `/place-order`
5. `/payment-confirmation`
6. `/my-account`
7. `/saved-lists`
8. `/brands`
9. `/brands/[brandId]`
10. homepage polish

## Why This Order

- it builds the actual purchase funnel first
- it gives you something real to test end to end
- once that works, orders/reviews/messages become much easier to implement correctly

