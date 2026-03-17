"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Boxes, PackageX, Search } from "lucide-react";
import type { InventoryProductGroup } from "@/actions/get-brand-inventory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InventoryClientProps {
  inventory: InventoryProductGroup[];
}

type FilterMode = "all" | "healthy" | "low_stock" | "out_of_stock";

function getStockBadgeClasses(state: FilterMode) {
  switch (state) {
    case "out_of_stock":
      return "border-red-300 bg-red-50 text-red-700";
    case "low_stock":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "healthy":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-700";
  }
}

function formatStockState(state: FilterMode) {
  if (state === "low_stock") return "Low Stock";
  if (state === "out_of_stock") return "Out of Stock";
  if (state === "healthy") return "Healthy";
  return "All";
}

export default function InventoryClient({ inventory }: InventoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const totalVariants = inventory.reduce((sum, product) => sum + product.variantCount, 0);
  const outOfStockVariants = inventory.reduce((sum, product) => sum + product.outOfStockVariants, 0);
  const lowStockVariants = inventory.reduce((sum, product) => sum + product.lowStockVariants, 0);
  const totalUnits = inventory.reduce((sum, product) => sum + product.totalStock, 0);

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventory
      .map((product) => {
        const variants = product.variants.filter((variant) => {
          const matchesFilter = filterMode === "all" || variant.stockState === filterMode;
          const matchesQuery =
            query.length === 0 ||
            product.name.toLowerCase().includes(query) ||
            product.categoryName.toLowerCase().includes(query) ||
            variant.name.toLowerCase().includes(query) ||
            variant.sku.toLowerCase().includes(query);

          return matchesFilter && matchesQuery;
        });

        return {
          ...product,
          variants,
        };
      })
      .filter((product) => product.variants.length > 0);
  }, [filterMode, inventory, searchQuery]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border-2 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tracked Units</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalUnits}</p>
        </div>
        <div className="border-2 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tracked Variants</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalVariants}</p>
        </div>
        <div className="border-2 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-800">Low-Stock Variants</p>
          <p className="mt-3 text-3xl font-semibold text-amber-900">{lowStockVariants}</p>
        </div>
        <div className="border-2 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">Out-of-Stock Variants</p>
          <p className="mt-3 text-3xl font-semibold text-red-900">{outOfStockVariants}</p>
        </div>
      </section>

      <section className="border-2 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
            <p className="mt-1 text-sm text-slate-600">
              Keep an eye on size-level stock so you can restock before a variant disappears.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by product, variant, SKU, category"
                className="pl-10"
              />
            </div>

            <select
              value={filterMode}
              onChange={(event) => setFilterMode(event.target.value as FilterMode)}
              className="h-12 min-w-[180px] rounded-none border-2 border-input bg-background px-3 text-sm"
            >
              <option value="all">All variants</option>
              <option value="healthy">Healthy only</option>
              <option value="low_stock">Low stock only</option>
              <option value="out_of_stock">Out of stock only</option>
            </select>
          </div>
        </div>
      </section>

      {(lowStockVariants > 0 || outOfStockVariants > 0) && (
        <section className="border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 text-amber-700" />
            <div>
              <h2 className="font-semibold text-amber-900">Stock attention needed</h2>
              <p className="mt-1 text-sm text-amber-800">
                {lowStockVariants > 0 && `${lowStockVariants} variant${lowStockVariants === 1 ? "" : "s"} are running low. `}
                {outOfStockVariants > 0 &&
                  `${outOfStockVariants} variant${outOfStockVariants === 1 ? "" : "s"} are currently out of stock.`}
              </p>
            </div>
          </div>
        </section>
      )}

      {filteredInventory.length === 0 ? (
        <section className="border-2 bg-white p-10 text-center shadow-sm">
          <Boxes className="mx-auto size-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No matching inventory</h2>
          <p className="mt-2 text-sm text-slate-600">
            Try adjusting the search or stock filter to find a variant.
          </p>
        </section>
      ) : (
        <section className="space-y-6">
          {filteredInventory.map((product) => (
            <article key={product.id} className="border-2 bg-white shadow-sm">
              <header className="border-b-2 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{product.categoryName}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                      {product.variantCount} variants
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                      {product.totalStock} units
                    </Badge>
                    {product.lowStockVariants > 0 && (
                      <Badge variant="outline" className={getStockBadgeClasses("low_stock")}>
                        {product.lowStockVariants} low stock
                      </Badge>
                    )}
                    {product.outOfStockVariants > 0 && (
                      <Badge variant="outline" className={getStockBadgeClasses("out_of_stock")}>
                        {product.outOfStockVariants} out of stock
                      </Badge>
                    )}
                  </div>
                </div>
              </header>

              <div className="divide-y-2">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 bg-slate-50">
                          {variant.mainImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={variant.mainImageUrl}
                              alt={variant.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <PackageX className="size-8 text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">{variant.name}</h3>
                              <Badge variant="outline" className={getStockBadgeClasses(variant.stockState)}>
                                {formatStockState(variant.stockState)}
                              </Badge>
                              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                                {variant.totalStock} units
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              SKU: {variant.sku || "Not set"} · Status: {variant.status}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {variant.sizeRows.map((sizeRow) => (
                              <div
                                key={`${variant.id}-${sizeRow.sizeName}`}
                                className="border-2 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                              >
                                <span className="font-medium">{sizeRow.sizeName}</span>
                                <span className="ml-2">{sizeRow.quantity}</span>
                                {sizeRow.stockState !== "healthy" && (
                                  <span
                                    className={
                                      sizeRow.stockState === "out_of_stock"
                                        ? "ml-2 text-red-700"
                                        : "ml-2 text-amber-700"
                                    }
                                  >
                                    {sizeRow.stockState === "out_of_stock" ? "Out" : "Low"}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 xl:min-w-[260px] xl:items-end">
                        {variant.lowStockSizesCount > 0 && (
                          <p className="text-sm text-amber-800">
                            {variant.lowStockSizesCount} size
                            {variant.lowStockSizesCount === 1 ? "" : "s"} running low.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" asChild>
                            <Link href={`/dashboard/edit-product/${product.id}`}>Edit Variant Stock</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
