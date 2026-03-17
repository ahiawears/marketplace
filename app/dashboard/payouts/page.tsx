import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, HandCoins, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { GetBrandBeneficiaryDetails } from "@/actions/get-brand-details/get-brand-beneficiary-details";
import { createClient } from "@/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  const metrics = [
    {
      label: "Payout accounts",
      value: `${payoutAccounts.length}`,
      description:
        payoutAccounts.length > 0
          ? "Your payout destination accounts are configured and ready for future settlement flows."
          : "Add at least one payout account to prepare for settlements.",
    },
    {
      label: "Default account",
      value: defaultAccount ? "Configured" : "Missing",
      description: defaultAccount
        ? `${defaultAccount.bank_name} ${maskAccountNumber(defaultAccount.account_number)}`
        : "Choose a default payout account so future settlements know where to land.",
    },
    {
      label: "Settlement history",
      value: "0",
      description: "Payout history and reconciliation events will populate here once live payout records exist.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="w-fit border-emerald-400 bg-emerald-50 text-emerald-800">
              Shell Page
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Finance & Payouts</h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                This page becomes the home for payout readiness, settlement history, and finance operations. It already
                reflects the real payout accounts you configured, while keeping payout history honest until real payout
                events and reconciliation data are flowing.
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
              The payout setup below is real. Settlement and reconciliation history should plug into this same page once
              payout events are live.
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
                No payout accounts have been added yet. Use Payment Settings to add a bank account before real payouts
                go live.
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
                Settlement history, payout dates, processing states, and amounts tied to real order revenue.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Reconciliation details between marketplace payments, fees, refunds, and bank payouts.
              </div>
              <div className="border-2 border-stone-200 p-4">
                Operational alerts when payout accounts need attention or payout processing changes status.
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
                Real payouts require finished checkout, reliable payment confirmation, payout event tracking, and
                webhook reconciliation.
              </p>
              <p>
                That is why this page is grounded in real payout setup now, while leaving settlement history for the
                point where the money flow itself is genuinely live.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-none border-2 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-stone-900">
              <Wallet className="h-5 w-5" />
              Next finance milestone
            </h2>
            <p className="text-sm leading-6 text-stone-600">
              Once payouts are live, this page should absorb settlement timelines, payout notifications, and finance
              reporting so brands can track cash movement without leaving the dashboard.
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
