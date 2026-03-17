import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  BookImage,
  CreditCard,
  PackageSearch,
  TicketPercent,
  Wallet,
} from "lucide-react";

import { createClient } from "@/supabase/server";
import { getProductItems } from "@/actions/brand-get-product-list";
import { getBrandInventory } from "@/actions/get-brand-inventory";
import { GetCoupons } from "@/actions/brand-actions/get-coupons";
import { getBrandLookbooks } from "@/actions/lookbooks/get-brand-lookbooks";
import { GetBrandBeneficiaryDetails } from "@/actions/get-brand-details/get-brand-beneficiary-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AttentionItem = {
  productId: string;
  productName: string;
  variantName: string;
  totalStock: number;
  state: "out_of_stock" | "low_stock";
};

function formatAttentionState(state: AttentionItem["state"]) {
  return state === "out_of_stock" ? "Out of Stock" : "Low Stock";
}

function getAttentionBadgeClass(state: AttentionItem["state"]) {
  return state === "out_of_stock"
    ? "border-red-300 bg-red-50 text-red-700"
    : "border-amber-300 bg-amber-50 text-amber-800";
}

function getComingSoonItems() {
  return [
    {
      title: "Orders",
      description: "Will become meaningful once checkout is fully live and real orders start flowing.",
    },
    {
      title: "Messages",
      description: "Ready for a polished shell, but real customer conversations should come after storefront activity.",
    },
    {
      title: "Reviews",
      description: "Best implemented after real purchases can generate real review records.",
    },
    {
      title: "Analytics",
      description: "Most useful once order, traffic, and conversion data are no longer placeholder signals.",
    },
  ];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login-brand");
  }

  const brandId = user.id;

  const [products, inventory, couponsResult, lookbooksResult, beneficiariesResult] = await Promise.all([
    getProductItems(brandId),
    getBrandInventory(brandId),
    GetCoupons(),
    getBrandLookbooks(brandId),
    GetBrandBeneficiaryDetails(brandId),
  ]);

  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, product) => sum + product.variantCount, 0);
  const archivedVariants = products.reduce(
    (sum, product) => sum + product.variants.filter((variant) => variant.status !== "active").length,
    0
  );

  const inventoryAttention = inventory
    .flatMap((product) =>
      product.variants
        .filter(
          (
            variant
          ): variant is typeof variant & {
            stockState: "out_of_stock" | "low_stock";
          } => variant.stockState === "out_of_stock" || variant.stockState === "low_stock"
        )
        .map<AttentionItem>((variant) => ({
          productId: product.id,
          productName: product.name,
          variantName: variant.name,
          totalStock: variant.totalStock,
          state: variant.stockState,
        }))
    )
    .sort((a, b) => {
      if (a.state !== b.state) {
        return a.state === "out_of_stock" ? -1 : 1;
      }
      return a.totalStock - b.totalStock;
    });

  const activeCoupons = (couponsResult.data || []).filter((coupon) => coupon.isActive).length;
  const totalCoupons = couponsResult.data?.length || 0;
  const publishedLookbooks = (lookbooksResult.data || []).filter((lookbook) => lookbook.is_published).length;
  const totalLookbooks = lookbooksResult.data?.length || 0;
  const payoutAccounts = beneficiariesResult.data || [];
  const defaultPayoutAccount = payoutAccounts.find((account) => account.is_default) || null;

  const metrics = [
    {
      title: "Catalog",
      value: `${totalProducts}`,
      supporting: `${totalVariants} variants across your storefront`,
      icon: PackageSearch,
    },
    {
      title: "Inventory Attention",
      value: `${inventoryAttention.length}`,
      supporting:
        inventoryAttention.length > 0
          ? "Variants currently need stock attention"
          : "No variants need urgent stock action",
      icon: AlertTriangle,
    },
    {
      title: "Marketing Assets",
      value: `${totalLookbooks + totalCoupons}`,
      supporting: `${publishedLookbooks} published lookbooks, ${activeCoupons} active coupons`,
      icon: BookImage,
    },
    {
      title: "Payout Setup",
      value: `${payoutAccounts.length}`,
      supporting: defaultPayoutAccount ? "Default payout account is configured" : "Choose a default payout account",
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="border-2 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              Brand Dashboard Overview
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Run the parts of your marketplace that are already live.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                This dashboard is now strongest around catalog, inventory, marketing assets, payout setup,
                shipping, and returns. The cards below surface where to act next without pretending orders
                and analytics are already fully live.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="border-2">
              <Link href="/dashboard/add-product">
                Add Product
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-2">
              <Link href="/dashboard/inventory">Open Inventory</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="rounded-none border-2 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {metric.title}
                </CardDescription>
                <metric.icon className="size-5 text-slate-500" />
              </div>
              <div>
                <CardTitle className="text-4xl font-semibold text-slate-900">{metric.value}</CardTitle>
                <p className="mt-2 text-sm text-slate-600">{metric.supporting}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-none border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Inventory Attention</CardTitle>
                <CardDescription>
                  Start here if you need the most urgent operational actions today.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="border-2">
                <Link href="/dashboard/inventory">View Inventory</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventoryAttention.length > 0 ? (
              inventoryAttention.slice(0, 5).map((item) => (
                <div
                  key={`${item.productId}-${item.variantName}`}
                  className="flex flex-col gap-3 border-2 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-600">{item.variantName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getAttentionBadgeClass(item.state)}>
                      {formatAttentionState(item.state)}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                      {item.totalStock} units
                    </Badge>
                    <Button asChild variant="ghost">
                      <Link href={`/dashboard/edit-product/${item.productId}`}>Restock</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-2 bg-slate-50 p-5 text-sm text-slate-600">
                Inventory looks healthy right now. No variants are currently flagged as low stock or out of stock.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Commerce Assets</CardTitle>
              <CardDescription>
                A quick read on the systems that already shape the storefront experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-2 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">Coupons</p>
                  <p className="text-sm text-slate-600">{activeCoupons} active of {totalCoupons} total</p>
                </div>
                <Button asChild variant="outline" className="border-2">
                  <Link href="/dashboard/coupons">Manage</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between border-2 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">Lookbooks</p>
                  <p className="text-sm text-slate-600">{publishedLookbooks} published of {totalLookbooks} total</p>
                </div>
                <Button asChild variant="outline" className="border-2">
                  <Link href="/dashboard/lookbook">Manage</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between border-2 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">Payout Accounts</p>
                  <p className="text-sm text-slate-600">
                    {defaultPayoutAccount
                      ? `Default: ${defaultPayoutAccount.bank_name} ••••${defaultPayoutAccount.account_number.slice(-4)}`
                      : "No default payout account selected yet"}
                  </p>
                </div>
                <Button asChild variant="outline" className="border-2">
                  <Link href="/dashboard/payment-settings">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Policy & Fulfillment Setup</CardTitle>
              <CardDescription>
                These pages are already important and testable even before real order volume exists.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" className="h-auto border-2 justify-start py-4">
                <Link href="/dashboard/shipping-configuration">
                  <Boxes className="size-4" />
                  Shipping Configuration
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto border-2 justify-start py-4">
                <Link href="/dashboard/return-policy">
                  <CreditCard className="size-4" />
                  Return Policy
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-none border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Catalog Snapshot</CardTitle>
            <CardDescription>
              A quick health check for what is currently live in your product catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="border-2 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Products</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalProducts}</p>
            </div>
            <div className="border-2 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Variants</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalVariants}</p>
            </div>
            <div className="border-2 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Archived</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{archivedVariants}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Coming Soon</CardTitle>
            <CardDescription>
              These modules are intentionally waiting on real customer activity and data.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {getComingSoonItems().map((item) => (
              <div key={item.title} className="border-2 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                    Soon
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
