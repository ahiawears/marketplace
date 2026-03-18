"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

interface StorefrontHeaderProps {
  genderContext?: "men" | "women";
}

export function StorefrontHeader({ genderContext }: StorefrontHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    const params = new URLSearchParams({ query: trimmed });
    if (genderContext) {
      params.set("gender", genderContext);
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <header className="border-b-2 bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 lg:flex">
              <Link href="/shop/women" className="transition hover:text-stone-900">
                Women
              </Link>
              <Link href="/shop/men" className="transition hover:text-stone-900">
                Men
              </Link>
              <Link href="/products" className="transition hover:text-stone-900">
                All products
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="outline" size="icon" className="rounded-none border-2">
              <Link href="/saved-lists" aria-label="Saved items">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="rounded-none border-2">
              <Link href="/cart" aria-label="Cart">
                <ShoppingCart className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-2xl items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder={
                genderContext
                  ? `Search ${genderContext} products, categories, or colors`
                  : "Search products, categories, or colors"
              }
              className="h-12 rounded-none border-2"
            />
            <Button type="button" onClick={handleSearch} className="h-12 rounded-none border-2 px-5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {genderContext ? (
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-stone-500">
              {genderContext} storefront
            </p>
          ) : (
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-stone-500">
              Multi-brand fashion marketplace
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
