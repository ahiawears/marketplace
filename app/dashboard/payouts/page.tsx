import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, HandCoins, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { GetBrandBeneficiaryDetails } from "@/actions/get-brand-details/get-brand-beneficiary-details";
import { createClient } from "@/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BrandOrderSettlementRow = {
  id: string;
  order_id: string | null;
  settlement_status: string | null;
  vendor_payable_customer_currency: number | null;
  customer_currency: string | null;
  return_window_ends_at: string | null;
  payout_released_at: string | null;
  created_at: string | null;
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

function maskAccountNumber(accountNumber: string) {
  if (!accountNumber) {
    return "—";
  }

  const visibleDigits = accountNumber.slice(-4);
  return `•••• ${visibleDigits}`;
}

export default async function PayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login-brand");
  }

  const beneficiaryResult = await GetBrandBeneficiaryDetails(user.id);
  const payoutAccounts = beneficiaryResult.data || [];
  const defaultAccount = payoutAccounts.find((account) => account.is_default) || null;
  const { data: brandOrders } = await supabase
    .from("brand_orders")
    .select("id, order_id, settlement_status, vendor_payable_customer_currency, customer_currency, return_window_ends_at, payout_released_at, created_at")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const typedBrandOrders = (brandOrders || []) as BrandOrderSettlementRow[];
  const heldOrders = typedBrandOrders.filter((order) => order.settlement_status === "held");
  const eligibleOrders = typedBrandOrders.filter((order) => order.settlement_status === "eligible_for_release");
  const releasedOrders = typedBrandOrders.filter((order) => order.settlement_status === "released");
  const primaryCurrency =
    typedBrandOrders.find((order) => order.customer_currency)?.customer_currency ||
    defaultAccount?.currency ||
    "USD";

  const heldAmount = heldOrders.reduce(
    (sum, order) => sum + Number(order.vendor_payable_customer_currency || 0),
    0
  );
  const eligibleAmount = eligibleOrders.reduce(
    (sum, order) => sum + Number(order.vendor_payable_customer_currency || 0),
    0
  );
  const releasedAmount = releasedOrders.reduce(
    (sum, order) => sum + Number(order.vendor_payable_customer_currency || 0),
    0
  );

  const nextReleaseOrder = heldOrders
    .filter((order) => order.return_window_ends_at)
    .sort((a, b) => {
      const aTime = new Date(a.return_window_ends_at || 0).getTime();
      const bTime = new Date(b.return_window_ends_at || 0).getTime();
      return aTime - bTime;
    })[0] || null;

  const metrics = [
    {
      label: "Held payouts",
      value: formatAmount(heldAmount, primaryCurrency),
      description:
        heldOrders.length > 0
          ? `${heldOrders.length} vendor orders are currently held until their return windows expire.`
          : "No held vendor payouts right now.",
    },
    {
      label: "Ready to release",
      value: formatAmount(eligibleAmount, primaryCurrency),
      description:
        eligibleOrders.length > 0
          ? `${eligibleOrders.length} vendor orders are ready for payout release once the release job runs.`
          : "No vendor payouts are eligible for release yet.",
    },
    {
      label: "Released payouts",
      value: formatAmount(releasedAmount, primaryCurrency),
      description:
        releasedOrders.length > 0
          ? `${releasedOrders.length} vendor orders have already been marked as released.`
          : "No vendor payouts have been released yet.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="w-fit border-emerald-400 bg-emerald-50 text-emerald-800">
              Live Settlement View
              </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Finance & Payouts</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page becomes the home for payout readiness, settlement history, and finance operations. It already
                now reflects real vendor-order payout holds and release readiness. Brands can see what money is still
                held, what has cleared its return window, and which payout destination will be used once settlements
                are released.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild>
              <Link href="/dashboard/payment-settings">
                Manage payout accounts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/notifications">Open finance notifications</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
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
              <Landmark className="h-5 w-5 text-stone-900" />
              Payout readiness
            </CardTitle>
            <CardDescription>
              The payout account setup below is real, and the settlement metrics above are now grounded in real
              `brand_orders` records created at checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payoutAccounts.length > 0 ? (
              payoutAccounts.map((account) => (
                <div key={account.id} className="border-2 border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-stone-900">{account.bank_name}</p>
                      <p className="text-sm text-stone-600">{account.beneficiary_name}</p>
                      <p className="font-mono text-sm text-stone-700">{maskAccountNumber(account.account_number)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="border-2 border-stone-300 bg-white px-2 py-1 text-stone-700">
                        {account.currency}
                      </span>
                      {account.is_default && (
                        <span className="border-2 border-emerald-400 bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
                          Default payout account
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-sm leading-6 text-stone-600">
                No payout accounts have been added yet. Use Payment Settings to add a bank account before released
                settlements go live.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-2 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <HandCoins className="h-5 w-5 text-stone-900" />
                What this page should own later
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="border-2 border-stone-200 p-4">
                Released payout runs, remittance references, and bank transfer outcomes tied to real vendor orders.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Reconciliation details between marketplace payments, held vendor balances, refunds, and bank payouts.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Operational alerts when payout accounts need attention or a held settlement becomes eligible.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 border-dashed shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-5 w-5 text-stone-900" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                Real payouts require finished checkout, reliable payment confirmation, webhook reconciliation, and a
                release step that only moves vendor funds after the return window closes.
              </p>
              <p>
                This page now tracks the hold state truthfully. The next step is automating eligible releases and then
                recording the actual payout transfer references back onto the released vendor orders.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Settlement Pipeline</CardTitle>
            <CardDescription>
              Recent vendor orders and where they currently sit in the held-to-release payout flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {typedBrandOrders.length > 0 ? (
              typedBrandOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="border-2 border-stone-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-stone-900">
                        Vendor order {order.order_id?.slice(0, 8) || order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-stone-600">
                        {formatAmount(Number(order.vendor_payable_customer_currency || 0), order.customer_currency || primaryCurrency)}
                      </p>
                      <p className="text-xs text-stone-500">
                        Return window ends: {order.return_window_ends_at ? new Date(order.return_window_ends_at).toLocaleString() : "Not set"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="border-2 border-stone-300 bg-white px-2 py-1 text-stone-700">
                        {order.settlement_status || "unknown"}
                      </span>
                      {order.payout_released_at && (
                        <span className="border-2 border-emerald-400 bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
                          Released {new Date(order.payout_released_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-sm leading-6 text-stone-600">
                No vendor orders have been created yet, so there are no held or releasable settlements to show.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Next Release Window</CardTitle>
            <CardDescription>
              The next held vendor order expected to become eligible for payout release.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
            {nextReleaseOrder ? (
              <>
                <div className="border-2 border-stone-200 p-4">
                  <p className="text-base font-semibold text-stone-900">
                    {formatAmount(
                      Number(nextReleaseOrder.vendor_payable_customer_currency || 0),
                      nextReleaseOrder.customer_currency || primaryCurrency
                    )}
                  </p>
                  <p>Eligible after: {new Date(nextReleaseOrder.return_window_ends_at as string).toLocaleString()}</p>
                </div>
                <p>
                  Once the return window passes, the scheduled release job should move this vendor order from
                  <span className="font-medium text-stone-900"> held </span>
                  to
                  <span className="font-medium text-stone-900"> eligible_for_release</span>.
                </p>
              </>
            ) : (
              <div className="border-2 border-dashed border-stone-300 bg-stone-50 p-6">
                No held vendor orders are waiting on a return-window release right now.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-none border-2 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-stone-900">
              <Wallet className="h-5 w-5" />
              Next finance milestone
            </h2>
            <p className="text-sm leading-6 text-stone-600">
              The next step is moving eligible vendor orders into a real payout run, then writing the payout reference
              and release timestamp back onto each released vendor order.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/payment-settings">Review payment settings</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
