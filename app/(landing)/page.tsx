import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getStorefrontNavigation } from "@/actions/storefront/get-storefront-navigation";
import { BestBrandsPlaceholder } from "@/components/customer-facing-components/storefront/best-brands-placeholder";
import { HomeGenderBand } from "@/components/customer-facing-components/storefront/home-gender-band";
import { HomeGenderNav } from "@/components/customer-facing-components/storefront/home-gender-nav";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const categories = await getStorefrontNavigation();

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-stone-900">
      <HomeGenderNav />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid gap-6 border-2 bg-white p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Promotional header</p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Discover independent fashion across one multi-brand marketplace.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                Search the full catalog, jump into women&apos;s or men&apos;s storefronts, and explore curated category
                discovery. This hero area is ready for future admin-controlled promotions without being tied to a single
                vendor.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-none border-2">
                <Link href="/shop/women">
                  Explore women
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-2">
                <Link href="/shop/men">
                  Explore men
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border-2 bg-stone-100 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Admin promo slot</p>
              <h2 className="mt-3 text-2xl font-semibold">Seasonal campaign headline</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Placeholder module for marketplace-wide promotions controlled later from the admin dashboard.
              </p>
            </div>
            <div className="border-2 bg-stone-950 p-6 text-stone-100">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Marketplace promise</p>
              <p className="mt-3 text-lg leading-7">
                Search should surface active, published, and currently released products only, across vendors and genders.
              </p>
            </div>
          </div>
        </section>

        <HomeGenderBand />

        <section className="space-y-5 border-2 bg-white p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Browse categories</p>
            <h2 className="text-2xl font-semibold tracking-tight">Start from a category</h2>
            <p className="max-w-2xl text-sm leading-6 text-stone-600">
              A homepage category search should show relevant active products across men, women, and unisex assortments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?cat=${encodeURIComponent(category)}`}
                className="border-2 border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:bg-white hover:text-stone-900"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <BestBrandsPlaceholder title="Best brands on the marketplace" />
      </main>
    </div>
  );
}
