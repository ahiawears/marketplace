# Brand Dashboard Menu Map

This file maps the current brand dashboard menu, the route behind each item, the main component/action used there, and the current implementation status.

## Sidebar Source

- Sidebar definition: [components/app-sidebar.tsx](/Users/apple/ahia/marketplace/components/app-sidebar.tsx)
- Dashboard layout wrapper: [app/dashboard/layout.tsx](/Users/apple/ahia/marketplace/app/dashboard/layout.tsx)

## High-Level Summary

- Solid / mostly working:
  - Dashboard overview
  - Add Product
  - Edit Product
  - Products List
  - Coupons
  - Shipping Configuration
  - Return Policy
  - Payment Settings
  - Notifications
  - Brand Profile Management

- Exists but looks partial / placeholder:
  - Lookbook
  - Orders
  - Messages
  - Brand Account Settings
  - Settings

- In sidebar but no real route/page found yet:
  - `/dashboard/products`
  - `/dashboard/inventory`
  - `/dashboard/reviews`
  - `/dashboard/marketing`
  - `/dashboard/analytics`
  - `/dashboard/payouts`
  - `/dashboard/support`

## Menu Map

### 1. Dashboard

- Menu item: `Dashboard`
- Route: `/dashboard`
- Page: [app/dashboard/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/page.tsx)
- Main UI:
  - [components/brand-dashboard/card-metrics-grid.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/card-metrics-grid.tsx)
  - chart components under `components/charts`
- Current status:
  - Page exists and renders dashboard cards/charts.
  - Uses client auth flow via `useAuth`.
  - `TopProductsCarousel` is commented out.
- Recommendation:
  - Convert to server-backed metrics when product/orders data is ready.
  - Avoid calling `setState` during render in this page.

### 2. Products

- Sidebar parent: `Products`
- Parent URL: `/dashboard/products`
- Current status:
  - No page found for this parent route.
  - Sidebar currently links to a non-existent route.
- Recommendation:
  - Either add a landing page for Products or change the parent item to be non-clickable.

#### 2a. Add Product

- Route: `/dashboard/add-product`
- Page: [app/dashboard/add-product/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/add-product/page.tsx)
- Main UI:
  - [components/brand-dashboard/add-product/add-product-client.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/add-product/add-product-client.tsx)
  - [components/brand-dashboard/add-product/product-form.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/add-product/product-form.tsx)
- Backend/service:
  - [actions/add-product/product-draft-service.ts](/Users/apple/ahia/marketplace/actions/add-product/product-draft-service.ts)
  - product upload API routes under [app/api/products](/Users/apple/ahia/marketplace/app/api/products)
- Current status:
  - This is now the main create-product flow.
  - Multi-step flow is working and much stronger than before.

#### 2b. Products List

- Route: `/dashboard/products-list`
- Page: [app/dashboard/products-list/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/products-list/page.tsx)
- Main UI:
  - [components/ui/list-product-table.tsx](/Users/apple/ahia/marketplace/components/ui/list-product-table.tsx)
  - [components/ui/product-variant-preview-dialog.tsx](/Users/apple/ahia/marketplace/components/ui/product-variant-preview-dialog.tsx)
- Data:
  - [hooks/useFetchAllProductsBrand.ts](/Users/apple/ahia/marketplace/hooks/useFetchAllProductsBrand.ts)
  - [actions/brand-get-product-list.ts](/Users/apple/ahia/marketplace/actions/brand-get-product-list.ts)
- Current status:
  - Real data is wired.
  - Variant preview modal exists.
  - Variant-level actions are visible.
- Still needed:
  - real hide/archive action
  - real delete action
  - maybe add product status filters/search

#### 2c. Edit Product

- Route: `/dashboard/edit-product/[id]`
- Page: [app/dashboard/edit-product/[id]/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/edit-product/[id]/page.tsx)
- Main UI:
  - same shared product form as Add Product
- Data loader:
  - [actions/add-product/load-product-editor-data.ts](/Users/apple/ahia/marketplace/actions/add-product/load-product-editor-data.ts)
- Current status:
  - Edit flow now uses the same shared create/edit product system.
  - This is the correct direction.

#### 2d. Inventory

- Route in sidebar: `/dashboard/inventory`
- Current status:
  - No route found.
- Recommendation:
  - Likely should become stock/variant quantity management based on `product_sizes.quantity`.

#### 2e. Lookbook

- Route: `/dashboard/lookbook`
- Page: [app/dashboard/lookbook/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/lookbook/page.tsx)
- Main UI:
  - [components/brand-dashboard/lookbook-client.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/lookbook-client.tsx)
  - [components/brand-dashboard/lookbook-editor.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/lookbook-editor.tsx)
  - [components/brand-dashboard/lookbook-list.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/lookbook-list.tsx)
- Current status:
  - UI exists.
  - Page currently uses a temporary `GetLookbooks()` with sample data.
  - Not fully backend-backed yet.
- Recommendation:
  - Needs real database model and CRUD before considering complete.

### 3. Orders & Customers

- Sidebar parent: `Orders & Customers`
- Parent URL: `/dashboard/orders`

#### 3a. Orders

- Route: `/dashboard/orders`
- Page: [app/dashboard/orders/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/orders/page.tsx)
- Main UI:
  - likely [components/ui/order-list-table.tsx](/Users/apple/ahia/marketplace/components/ui/order-list-table.tsx)
  - [components/brand-dashboard/order-details-modal.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/order-details-modal.tsx)
- Current status:
  - Page exists.
  - Looks heavily sample/mock-data driven.
  - Useful shell, but not yet a finished live order management page.

#### 3b. Messages

- Route: `/dashboard/messages`
- Page: [app/dashboard/messages/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/messages/page.tsx)
- Main UI:
  - message list and chat components under `components/messages`
- Current status:
  - Exists, but appears mock-data oriented / incomplete.
  - Needs real thread/message backend integration.

#### 3c. Reviews

- Route in sidebar: `/dashboard/reviews`
- Current status:
  - No route found.
- Recommendation:
  - Add only if review system exists on storefront/backend.

### 4. Marketing

- Sidebar parent: `Marketing`
- Parent URL: `/dashboard/marketing`
- Current status:
  - No parent route found.

#### 4a. Coupons

- Route: `/dashboard/coupons`
- Page: [app/dashboard/coupons/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/coupons/page.tsx)
- Main UI:
  - [components/brand-dashboard/coupon-client.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/coupon-client.tsx)
  - [components/brand-dashboard/add-coupon-form.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/add-coupon-form.tsx)
  - [components/brand-dashboard/brand-coupons-list.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-coupons-list.tsx)
- Data/actions:
  - [actions/brand-actions/get-coupons.ts](/Users/apple/ahia/marketplace/actions/brand-actions/get-coupons.ts)
  - [actions/brand-actions/create-coupon.ts](/Users/apple/ahia/marketplace/actions/brand-actions/create-coupon.ts)
  - [actions/brand-actions/update-coupon.ts](/Users/apple/ahia/marketplace/actions/brand-actions/update-coupon.ts)
- Current status:
  - One of the more complete dashboard modules.
  - Fetches products and coupons, supports create/edit.

#### 4b. Lookbook

- Same as Products > Lookbook
- Note:
  - Sidebar duplicates this feature under two sections.
- Recommendation:
  - Keep only one navigation location, or make one a shortcut with clear intent.

### 5. Analytics

- Route in sidebar: `/dashboard/analytics`
- Current status:
  - No route found.
- Recommendation:
  - Could later become a dedicated page extracted from dashboard metrics/charts.

### 6. Brand Settings

- Sidebar parent: `Brand Settings`
- Parent URL: `/dashboard/settings`

#### 6a. Brand Profile

- Route: `/dashboard/brand-profile-management`
- Page: [app/dashboard/brand-profile-management/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/brand-profile-management/page.tsx)
- Main UI:
  - [components/brand-dashboard/brand-profile-client.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-profile-client.tsx)
  - [components/brand-dashboard/brand-profile-page.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-profile-page.tsx)
  - [components/brand-dashboard/edit-brand-logo.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/edit-brand-logo.tsx)
  - [components/brand-dashboard/edit-brand-profile-hero.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/edit-brand-profile-hero.tsx)
  - [components/brand-dashboard/brand-description-field.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-description-field.tsx)
  - [components/brand-dashboard/brand-social-links.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-social-links.tsx)
- Current status:
  - Real data loading exists.
  - Good candidate for completion polish rather than major rewrite.

#### 6b. Shipping Configuration

- Route: `/dashboard/shipping-configuration`
- Page: [app/dashboard/shipping-configuration/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/shipping-configuration/page.tsx)
- Main UI:
  - [components/brand-dashboard/shipping-configuration-form.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/shipping-configuration-form.tsx)
- Current status:
  - Real data-backed module.
  - Strong startup-level settings page.

#### 6c. Return Policy

- Route: `/dashboard/return-policy`
- Page: [app/dashboard/return-policy/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/return-policy/page.tsx)
- Main UI:
  - [components/brand-dashboard/return-policy-form.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/return-policy-form.tsx)
- Current status:
  - One of the strongest settings flows now.
  - Uses schema validation, better error mapping, and atomic DB write flow.

#### 6d. Payment Settings

- Route: `/dashboard/payment-settings`
- Page: [app/dashboard/payment-settings/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/payment-settings/page.tsx)
- Main UI:
  - [components/brand-dashboard/payment-setting-client.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/payment-setting-client.tsx)
  - [components/brand-dashboard/add-bank-form.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/add-bank-form.tsx)
  - [components/brand-dashboard/brand-banks-list.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-banks-list.tsx)
- Current status:
  - Real data loading exists.
  - Supports adding beneficiary/bank accounts.
  - Good candidate for completion and polish.

#### 6e. Notifications

- Route: `/dashboard/notifications`
- Page: [app/dashboard/notifications/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/notifications/page.tsx)
- Main UI:
  - [components/brand-dashboard/brand-notification-table.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-notification-table.tsx)
- Current status:
  - Real page exists.
  - Needs verification for whether persistence is fully wired.
- Planned next:
  - low-stock email alerts
  - low-stock in-app alerts
- Later to add:
  - low-stock email alerts
  - low-stock in-app alerts

#### 6f. Settings

- Route: `/dashboard/settings`
- Page: [app/dashboard/settings/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/settings/page.tsx)
- Current status:
  - Legacy/general settings page.
  - Overlaps with the stronger dedicated settings pages above.
  - Fetches from `/api/getBrandById` and looks outdated.
- Recommendation:
  - Probably remove or replace with a simple settings hub page that links to:
    - Brand Profile
    - Shipping Configuration
    - Return Policy
    - Payment Settings
    - Notifications

#### 6g. Brand Account Settings

- Route: `/dashboard/brand-account-settings`
- Page: [app/dashboard/brand-account-settings/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/brand-account-settings/page.tsx)
- Main UI:
  - [components/brand-dashboard/brand-account-settings.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/brand-account-settings.tsx)
  - [components/brand-dashboard/change-brand-password.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/change-brand-password.tsx)
  - [components/brand-dashboard/change-brand-email.tsx](/Users/apple/ahia/marketplace/components/brand-dashboard/change-brand-email.tsx)
- Current status:
  - Exists but is not currently in the sidebar.
- Recommendation:
  - This should likely be linked under Brand Settings.

#### 6h. Brand Social Links

- Route: `/dashboard/brand-socials-links`
- Page: [app/dashboard/brand-socials-links/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/brand-socials-links/page.tsx)
- Current status:
  - Exists but is not in the sidebar.
  - Looks older and may overlap with Brand Profile Management.
- Recommendation:
  - Merge into Brand Profile Management if possible.

### 7. Finance

- Sidebar parent: `Finance`
- Parent URL: `/dashboard/payouts`
- Current status:
  - No payout route found.
  - Payment settings exists, but payout history/settlements page does not.
- Recommendation:
  - Later build around payout records, beneficiary accounts, settlement status.

### 8. Support

- Route in sidebar: `/dashboard/support`
- Current status:
  - No route found.
- Recommendation:
  - Add a simple help/support page or remove until needed.

## Duplicate / Stale / Odd Items

- [app/dashboard/brand-settings-page/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/brand-settings-page/page.tsx)
  - Empty file / placeholder
- [app/dashboard/settings/page.tsx](/Users/apple/ahia/marketplace/app/dashboard/settings/page.tsx)
  - legacy general settings page, overlaps with dedicated settings modules
- `Lookbook` appears under both Products and Marketing in sidebar
- Sidebar links to missing pages:
  - `/dashboard/products`
  - `/dashboard/inventory`
  - `/dashboard/reviews`
  - `/dashboard/marketing`
  - `/dashboard/analytics`
  - `/dashboard/payouts`
  - `/dashboard/support`

## Recommended Completion Order

### Tier 1: Finish high-value brand operations

1. Products List actions
   - real variant hide/archive
   - real delete/archive
   - filters and search
2. Orders
   - replace mock data with real order queries
   - order detail modal actions
3. Brand Profile Management
   - verify all fields persist cleanly
4. Payment Settings
   - edit/remove beneficiary accounts
   - better bank-country handling

### Tier 2: Finish supporting settings

5. Notifications
   - confirm save/persistence and categories
6. Shipping Configuration
   - final polish / validation cleanup
7. Return Policy
   - mostly done, low priority now

### Tier 3: Build missing modules

8. Inventory page
   - stock table from product variants + sizes
9. Reviews page
10. Payouts page
11. Analytics page
12. Support page

### Tier 4: Clean navigation

13. Replace `/dashboard/settings` with a settings hub
14. Remove/merge stale pages:
   - `brand-settings-page`
   - `brand-socials-links` if redundant
15. Remove or fix sidebar links to missing routes
16. Add low-stock email and in-app alert controls under Notifications
16. Add low-stock notification rules under Notifications

## Suggested Final Sidebar Structure

- Dashboard
- Products
  - Add Product
  - Products List
  - Inventory
  - Lookbook
- Orders & Customers
  - Orders
  - Messages
  - Reviews
- Marketing
  - Coupons
- Analytics
- Brand Settings
  - Brand Profile
  - Account Settings
  - Shipping Configuration
  - Return Policy
  - Payment Settings
  - Notifications
- Finance
  - Payouts
- Support

## Notes

- The product area is now the most mature dashboard module.
- Return policy and shipping configuration are also in a good place.
- The biggest unfinished dashboard areas are orders/customers, inventory, payouts, analytics, and support.
- Before launch, the sidebar should not link to routes that do not exist.
