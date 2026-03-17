import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, ChartNoAxesColumn, MousePointerClick, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const analyticsMetrics = [
  {
    label: "Revenue tracked",
    value: "—",
    description: "Revenue analytics should begin once checkout and payment confirmation are fully live.",
  },
  {
    label: "Conversion rate",
    value: "—",
    description: "Conversion requires real storefront visits flowing into add-to-cart and completed orders.",
  },
  {
    label: "Top product signals",
    value: "0",
    description: "Product performance rankings will become meaningful once browsing and purchasing are active.",
  },
];

const analyticsSections = [
  {
    title: "Catalog performance",
    description:
      "Compare product and variant performance, identify weak listings, and understand which catalog decisions are driving traction.",
    icon: Boxes,
  },
  {
    title: "Traffic and engagement",
    description:
      "Track visits, product detail views, add-to-cart actions, and where customer drop-off is happening in the funnel.",
    icon: MousePointerClick,
  },
  {
    title: "Sales trends",
    description:
      "Monitor revenue, average order value, discount impact, and seasonal demand once real commerce events exist.",
    icon: TrendingUp,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="w-fit border-sky-400 bg-sky-50 text-sky-800">
              Shell Page
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Analytics</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page is ready to become the reporting hub for storefront traffic, product performance, and sales
                trends. For now it stays honest about the data it needs, while giving the dashboard a real place for
                future analytics instead of a dead route.
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
              <Link href="/products">Open storefront catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {analyticsMetrics.map((metric) => (
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ChartNoAxesColumn className="h-5 w-5 text-stone-900" />
              Analytics modules to light up next
            </CardTitle>
            <CardDescription>
              These sections are the right long-term structure once the storefront is producing real traffic and order
              data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsSections.map((section, index) => (
              <div key={section.title} className="flex gap-4 border-2 border-stone-200 bg-stone-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-stone-900 bg-white">
                  <section.icon className="h-4 w-4 text-stone-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Module {index + 1}
                  </p>
                  <h2 className="text-base font-semibold text-stone-900">{section.title}</h2>
                  <p className="text-sm leading-6 text-stone-600">{section.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-2 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-stone-900" />
                What this page should eventually answer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="border-2 border-stone-200 p-4">
                Which products convert best, and which listings need better images, pricing, or copy?
              </div>
              <div className="border-2 border-stone-200 p-4">
                Where are customers dropping off between catalog view, product view, cart, and checkout?
              </div>
              <div className="border-2 border-stone-200 p-4">
                How are promotions, stockouts, and seasonal launches affecting revenue and sell-through?
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 border-dashed shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                Real analytics should wait for live storefront browsing, product detail engagement, add-to-cart events,
                checkout completion, and stable order records.
              </p>
              <p>
                That is why this page is a structured shell now: it keeps the dashboard complete without faking charts
                or meaningless numbers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
