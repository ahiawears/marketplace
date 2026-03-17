import Link from "next/link";
import { ArrowRight, MessageSquareText, ShieldCheck, Sparkles, Star, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reviewMetrics = [
  {
    label: "Published reviews",
    value: "0",
    description: "Verified customer feedback will appear here once the storefront order flow is live.",
  },
  {
    label: "Average rating",
    value: "—",
    description: "Average star rating will calculate after the first approved reviews are collected.",
  },
  {
    label: "Pending moderation",
    value: "0",
    description: "Flagged or unreviewed submissions will queue here for action.",
  },
];

const moderationSteps = [
  {
    title: "Collect verified purchase reviews",
    description:
      "Reviews should be tied to real completed orders so brands can trust the signal and moderate with context.",
    icon: ShieldCheck,
  },
  {
    title: "Surface issues that need attention",
    description:
      "Low ratings, repeated complaints, and product-specific quality signals should stand out immediately.",
    icon: MessageSquareText,
  },
  {
    title: "Turn feedback into product improvements",
    description:
      "The long-term value is linking reviews back to products, variants, sizing, quality, and shipping expectations.",
    icon: Tags,
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="w-fit border-amber-500 bg-amber-50 text-amber-800">
              Shell Page
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Reviews</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page is ready as the moderation and insight hub for customer reviews. The storefront review flow
                is not live yet, so the page focuses on the structure brands will use once verified feedback starts
                arriving.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild>
              <Link href="/products">
                Review the storefront catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/products-list">Go to products list</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {reviewMetrics.map((metric) => (
          <Card key={metric.label} className="rounded-none border-2 shadow-none">
            <CardHeader className="space-y-3 pb-3">
              <CardDescription className="text-xs uppercase tracking-[0.24em] text-stone-500">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-3xl text-stone-900">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-stone-600">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="h-5 w-5 text-stone-900" />
              Review moderation workflow
            </CardTitle>
            <CardDescription>
              The layout is ready for the real moderation queue once customer reviews are flowing through the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {moderationSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4 border-2 border-stone-200 bg-stone-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-stone-900 bg-white">
                  <step.icon className="h-4 w-4 text-stone-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Step {index + 1}
                  </p>
                  <h2 className="text-base font-semibold text-stone-900">{step.title}</h2>
                  <p className="text-sm leading-6 text-stone-600">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-2 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">What will appear here later</CardTitle>
              <CardDescription>
                These are the real dashboard outcomes this page should own after the storefront review flow is built.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="border-2 border-stone-200 p-4">
                Product-level rating summaries, common praise themes, and recurring complaints.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Filters for rating, product, review status, and whether a reply is still needed.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Brand replies, moderation actions, and deeper quality insights tied back to catalog decisions.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 border-dashed shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-stone-900" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                To make this page real, the customer funnel still needs product detail, checkout, order completion, and
                a verified review submission path.
              </p>
              <p>
                That is why this page is a shell for now: it keeps the dashboard complete without faking review data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
