import Link from "next/link";
import { ArrowRight, Boxes, ListOrdered, PackageCheck, ShieldAlert, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const orderMetrics = [
  {
    label: "Orders received",
    value: "0",
    description: "Real order counts will appear here after the customer checkout flow starts creating live purchases.",
  },
  {
    label: "Awaiting fulfillment",
    value: "0",
    description: "This should become the operational queue for orders that still need picking, packing, or shipping.",
  },
  {
    label: "Returns / issues",
    value: "0",
    description: "Order exceptions and return-linked issues can live here once those customer flows are active.",
  },
];

const orderWorkflow = [
  {
    title: "Receive new orders",
    description:
      "New purchases should land here with the order summary, customer context, payment state, and the items that need fulfillment.",
    icon: ListOrdered,
  },
  {
    title: "Fulfill and ship",
    description:
      "This is where shipment updates, tracking numbers, and operational progress should move orders toward completion.",
    icon: Truck,
  },
  {
    title: "Handle exceptions",
    description:
      "Cancelled orders, failed payments, delivery issues, and return requests should be visible without mixing them into the happy path.",
    icon: ShieldAlert,
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="w-fit border-blue-400 bg-blue-50 text-blue-800">
              Shell Page
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Orders</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page is ready to become your fulfillment and order-operations hub. It stays honest for now by
                focusing on the workflow and empty states the brand dashboard will need once the customer checkout flow
                is live.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild>
              <Link href="/dashboard/products-list">
                Review product availability
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/return-policy">Open return policy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {orderMetrics.map((metric) => (
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PackageCheck className="h-5 w-5 text-stone-900" />
              Fulfillment workflow
            </CardTitle>
            <CardDescription>
              This is the shape the orders page should keep when real purchases start flowing through the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderWorkflow.map((step, index) => (
              <div key={step.title} className="flex gap-4 border-2 border-stone-200 bg-stone-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-stone-900 bg-white">
                  <step.icon className="h-4 w-4 text-stone-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Stage {index + 1}
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
              <CardTitle className="flex items-center gap-2 text-xl">
                <Boxes className="h-5 w-5 text-stone-900" />
                What should appear here later
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="border-2 border-stone-200 p-4">
                Order rows with customer details, payment state, product items, shipping method, and fulfillment status.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Filters for new, processing, shipped, delivered, cancelled, and return-linked states.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Action controls for marking shipped, adding tracking, reviewing exceptions, and resolving customer issues.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 border-dashed shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                Real order management depends on the customer catalog, product detail, cart, checkout, payment
                confirmation, and order-write path all being stable first.
              </p>
              <p>
                That is why this page is now a shell: it gives the dashboard a proper destination without faking order
                data that does not exist yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
