import Link from "next/link";
import { notFound } from "next/navigation";
import { getStorefrontNavigation } from "@/actions/storefront/get-storefront-navigation";
import { BestBrandsPlaceholder } from "@/components/customer-facing-components/storefront/best-brands-placeholder";
import { Button } from "@/components/ui/button";

const genderCopy = {
  women: {
    title: "Women",
    description:
      "Browse the women’s storefront with editorial entry points, category-led discovery, and space for marketplace-wide promotions curated by the admin side later.",
  },
  men: {
    title: "Men",
    description:
      "Browse the men’s storefront with sharper category discovery, seasonal highlights, and curated modules that can evolve into admin-controlled promotions later.",
  },
} as const;

interface ShopGenderPageProps {
  params: Promise<{
    gender: string;
  }>;
}

export default async function ShopGenderPage({ params }: ShopGenderPageProps) {
  const { gender } = await params;
  const normalizedGender = gender.toLowerCase();

  if (normalizedGender !== "women" && normalizedGender !== "men") {
    notFound();
  }

  const categories = await getStorefrontNavigation();
  const copy = genderCopy[normalizedGender as keyof typeof genderCopy];

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid gap-6 border-2 bg-white p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{copy.title} storefront</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">{copy.title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">{copy.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-none border-2">
                <Link href={`/products?gender=${encodeURIComponent(normalizedGender)}`}>Shop all {normalizedGender}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-2">
                <Link href="/">Back to main landing</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-2 bg-stone-100 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Promo slot</p>
              <h2 className="mt-3 text-2xl font-semibold">Featured campaign</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                This module is reserved for future admin-curated campaigns targeted at the {normalizedGender} landing page.
              </p>
            </div>
            <div className="border-2 bg-stone-900 p-6 text-stone-100">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Search rule</p>
              <p className="mt-3 text-lg leading-7">
                Searches from this landing page should stay scoped to {normalizedGender} variants only.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-5 border-2 bg-white p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Category discovery</p>
            <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
            <p className="max-w-2xl text-sm leading-6 text-stone-600">
              Category links from this page stay gender-scoped, so the product grid only returns matching released variants.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?cat=${encodeURIComponent(category)}&gender=${encodeURIComponent(normalizedGender)}`}
                className="border-2 border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:bg-white hover:text-stone-900"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <BestBrandsPlaceholder title={`Top ${copy.title.toLowerCase()} brands`} />
      </main>
    </div>
  );
}
