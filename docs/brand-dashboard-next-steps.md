# Brand Dashboard Next Steps

This file lists the brand dashboard areas we can still build or polish **before** relying on customer-side activity.

It is meant to be a practical working order for finishing most of the brand dashboard first, then moving to customer-facing flows later.

## Good To Build Now

These pages or features do **not** need real customer actions to be useful and testable.

### 1. Orders Page Shell Upgrade

Route:
- `/dashboard/orders`

Why it can be done now:
- The page already exists.
- We can make it a strong operational shell even if live order data is not fully flowing yet.

What can be built now:
- clean empty state
- order-status filters
- summary cards
- better table layout
- “no orders yet” onboarding guidance
- realistic placeholder state instead of obviously fake demo rows

What should wait:
- true fulfillment flow
- live order updates from real purchases

Priority:
- High

### 2. Messages Page Shell Upgrade

Route:
- `/dashboard/messages`

Why it can be done now:
- The page exists and can be made visually and structurally solid before real conversations exist.

What can be built now:
- proper empty state
- better inbox layout
- conversation placeholder states
- “customer messages will appear here” messaging
- unread badge design

What should wait:
- real chat threads
- live message persistence

Priority:
- Medium

### 3. Reviews Page

Route:
- currently missing

Why it can be done now:
- We can create a clean placeholder dashboard page and remove the dead route problem.

What can be built now:
- page shell
- empty state
- future metrics layout
- filters UI

What should wait:
- real review ingestion from storefront

Priority:
- Medium

Current status:
- Completed as a shell page.
- The route now exists and gives brands a real moderation/insight placeholder without inventing fake review data.

### 4. Analytics Page

Route:
- currently missing

Why it can be done now:
- You already have dashboard metrics/cards/charts patterns.
- We can create a dedicated analytics page with placeholder and starter metrics.

What can be built now:
- analytics layout
- overview cards
- product performance section
- traffic/sales placeholder charts
- explanatory empty states

What should wait:
- real conversion/sales/traffic pipelines

Priority:
- Medium

### 5. Finance / Payouts Page

Route:
- currently missing

Why it can be done now:
- Payment Settings is already strong enough to support a finance shell.

What can be built now:
- payout accounts summary
- default payout account display
- payout history placeholder
- “no payouts yet” empty state
- payout status legend

What should wait:
- real payout event history
- webhook reconciliation data

Priority:
- Medium

### 6. Support Page

Route:
- currently missing

Why it can be done now:
- It can exist as a real internal help hub without customer flows.

What can be built now:
- support resources hub
- contact/support CTA
- FAQ section
- links to shipping, return policy, payment settings

Priority:
- Medium

### 7. Dashboard Overview Polish

Route:
- `/dashboard`

Why it can be done now:
- The page exists, but it can better reflect the solid modules you now have.

What was improved:
- inventory attention card
- lookbook count
- coupon count
- payout account summary
- cleaner “coming soon” cards for customer-dependent modules

Priority:
- High

Current status:
- Completed.
- The dashboard home is now server-backed and already reflects live operational summaries for catalog, inventory attention, marketing assets, payouts, and quick links.

### 8. Products List Actions

Route:
- `/dashboard/products-list`

Why it can be done now:
- The page is already working and does not depend on customer actions.

What can be improved now:
- replace browser `window.confirm` with a custom delete confirmation dialog/modal
- improve delete flow UX and messaging for variants blocked by order history
- better filters
- status filter
- bulk actions later

Priority:
- High

### 9. Lookbook Public Preview / Brand Preview

Route:
- `/dashboard/lookbook`

Why it can be done now:
- Lookbook CRUD is now real.
- A dashboard-side preview can be built before customer-facing public routing.

What can be built now:
- preview modal/page
- product tag preview overlay
- published/draft distinction
- cover page preview polish

Priority:
- Medium

## Better To Wait Until Customer Flows Exist

These areas are better left until customer activity creates meaningful real data.

### Orders Full Logic
- fulfillment
- shipment updates
- returns against real orders

### Messages Full Logic
- real inbox threads
- live send/receive

### Reviews Real Management
- real review records
- moderation workflow

### Analytics Real Accuracy
- sales conversion
- traffic attribution
- actual customer engagement metrics

## Recommended Build Order

If the goal is to finish as much of the brand dashboard as possible before switching to customer pages, this is the order I recommend:

1. Products List Real Actions
2. Analytics Page Shell
3. Finance / Payouts Page Shell
4. Support Page
5. Orders Page Shell Upgrade
6. Messages Page Shell Upgrade
7. Lookbook Preview Polish

## Best Next Step

The best next move is:

### Products List Real Actions

Reason:
- already live
- high operational value
- fully testable now
- reduces launch risk

Specifically:
- replace browser `window.confirm` with a custom delete confirmation dialog/modal
- improve blocked-delete messaging when order history prevents hard delete
- keep variant actions and filtering polished as the management surface matures
