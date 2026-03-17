import Link from "next/link";
import { ArrowRight, CreditCard, LifeBuoy, Package, ShieldCheck, TicketPercent, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const supportLinks = [
  {
    title: "Shipping Configuration",
    description: "Review delivery methods, zones, handling times, and fee defaults.",
    href: "/dashboard/shipping-configuration",
    icon: Truck,
  },
  {
    title: "Return Policy",
    description: "Update return rules, restocking fees, and evidence requirements.",
    href: "/dashboard/return-policy",
    icon: ShieldCheck,
  },
  {
    title: "Payment Settings",
    description: "Manage payout accounts and confirm your payout setup is ready.",
    href: "/dashboard/payment-settings",
    icon: CreditCard,
  },
  {
    title: "Coupons",
    description: "Review active promotions and coupon setup for your catalog.",
    href: "/dashboard/coupons",
    icon: TicketPercent,
  },
];

const faqItems = [
  {
    question: "What should I verify before opening the storefront to customers?",
    answer:
      "Make sure products, inventory, shipping configuration, return policy, payout accounts, and key marketing assets are all reviewed and saved.",
  },
  {
    question: "Why do some dashboard pages still show shell states?",
    answer:
      "Pages like orders, messages, reviews, and analytics become truly useful only after the customer funnel starts producing real activity.",
  },
  {
    question: "Where should I go if a product cannot be deleted?",
    answer:
      "Use Products List to archive the variant instead. Variants with order history should remain traceable for support and auditing.",
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="w-fit border-violet-400 bg-violet-50 text-violet-800">
              Support Hub
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Support</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page gives brands one place to find the operational settings and guidance they are most likely to
                need while managing the marketplace. It is intentionally practical now, and can grow into a deeper help
                center later.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild>
              <Link href="/dashboard">
                Back to dashboard overview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/products-list">Open products list</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {supportLinks.map((item) => (
          <Card key={item.title} className="rounded-none border-2 shadow-none">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Quick Link
                </CardDescription>
                <item.icon className="h-5 w-5 text-stone-900" />
              </div>
              <CardTitle className="text-xl text-stone-900">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-stone-600">{item.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LifeBuoy className="h-5 w-5 text-stone-900" />
              Common support questions
            </CardTitle>
            <CardDescription>
              Use this as the first-stop help layer while the dashboard is still maturing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="border-2 border-stone-200 bg-stone-50 p-4">
                <h2 className="text-base font-semibold text-stone-900">{item.question}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-2 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Recommended support flow</CardTitle>
              <CardDescription>
                A simple escalation order for brands before customer-side activity is fully live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="border-2 border-stone-200 p-4">
                1. Check the relevant settings page first so configuration issues are ruled out quickly.
              </div>
              <div className="border-2 border-stone-200 p-4">
                2. Review product, inventory, and payout setup to confirm the operational data is correct.
              </div>
              <div className="border-2 border-stone-200 p-4">
                3. Once storefront flows are live, expand this page into a real help center with issue categories and escalation tracking.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 border-dashed shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-stone-900" />
                Later expansion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                This page can later absorb support ticket links, operational incident notices, and guided troubleshooting
                for orders, payouts, returns, and catalog issues.
              </p>
              <p>
                For now, the most valuable version is a focused hub that points brands toward the pages that already
                work.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
