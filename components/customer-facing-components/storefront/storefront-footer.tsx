import Link from "next/link";

interface StorefrontFooterProps {
  categoryLinks: string[];
}

export function StorefrontFooter({ categoryLinks }: StorefrontFooterProps) {
  const topCategories = categoryLinks.slice(0, 8);

  return (
    <footer className="mt-16 border-t-2 bg-stone-950 text-stone-100">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">ahia marketplace</p>
          <h2 className="max-w-md text-2xl font-semibold leading-tight">
            Discover independent brands, fresh drops, and editorial fashion across one marketplace.
          </h2>
          <p className="max-w-lg text-sm leading-6 text-stone-400">
            The customer journey starts with discovery, then moves into product detail, saved items, cart, and
            checkout. This footer keeps the structure simple while the storefront continues maturing.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">Shop</p>
          <div className="grid gap-2 text-sm text-stone-200">
            <Link href="/shop/women" className="transition hover:text-white">
              Women
            </Link>
            <Link href="/shop/men" className="transition hover:text-white">
              Men
            </Link>
            <Link href="/products" className="transition hover:text-white">
              All products
            </Link>
            <Link href="/brands" className="transition hover:text-white">
              Brands
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">Popular categories</p>
          <div className="grid gap-2 text-sm text-stone-200">
            {topCategories.map((category) => (
              <Link
                key={category}
                href={`/products?cat=${encodeURIComponent(category)}`}
                className="transition hover:text-white"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
