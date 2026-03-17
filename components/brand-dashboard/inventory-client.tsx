"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDownUp, Boxes, PackageX, Search } from "lucide-react";
import { toast } from "sonner";
import type { InventoryProductGroup } from "@/actions/get-brand-inventory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "../ui/select";

interface InventoryClientProps {
  inventory: InventoryProductGroup[];
}

type FilterMode = "all" | "healthy" | "low_stock" | "out_of_stock";
type SortMode = "attention_first" | "product_name";

function getStockBadgeClasses(state: FilterMode) {
  switch (state) {
    case "out_of_stock":
      return "border-red-300 border-2 bg-red-50 text-red-700";
    case "low_stock":
      return "border-amber-300 border-2 bg-amber-50 text-amber-800";
    case "healthy":
      return "border-emerald-300 border-2 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-300 border-2 bg-slate-50 text-slate-700";
  }
}

function formatStockState(state: FilterMode) {
  if (state === "low_stock") return "Low Stock";
  if (state === "out_of_stock") return "Out of Stock";
  if (state === "healthy") return "Healthy";
  return "All";
}

function getAttentionScore(stockState: FilterMode, totalStock: number) {
  if (stockState === "out_of_stock") return -1000;
  if (stockState === "low_stock") return totalStock;
  return 100000 + totalStock;
}

export default function InventoryClient({ inventory }: InventoryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("attention_first");
  const [showAttentionOnly, setShowAttentionOnly] = useState(false);
  const [draftQuantities, setDraftQuantities] = useState<Record<string, string>>({});
  const [savingSizeIds, setSavingSizeIds] = useState<Record<string, boolean>>({});

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
          const matchesAttention = !showAttentionOnly || variant.stockState !== "healthy";
          const matchesQuery =
            query.length === 0 ||
            product.name.toLowerCase().includes(query) ||
            product.categoryName.toLowerCase().includes(query) ||
            variant.name.toLowerCase().includes(query) ||
            variant.sku.toLowerCase().includes(query);

          return matchesFilter && matchesAttention && matchesQuery;
        }).sort((a, b) => {
          if (sortMode === "product_name") {
            return a.name.localeCompare(b.name);
          }

          const scoreDiff =
            getAttentionScore(a.stockState, a.totalStock) -
            getAttentionScore(b.stockState, b.totalStock);

          if (scoreDiff !== 0) return scoreDiff;
          return a.name.localeCompare(b.name);
        });

        return {
          ...product,
          variants,
        };
      })
      .sort((a, b) => {
        if (sortMode === "product_name") {
          return a.name.localeCompare(b.name);
        }

        const aScore = Math.min(
          ...a.variants.map((variant) => getAttentionScore(variant.stockState, variant.totalStock)),
          100000
        );
        const bScore = Math.min(
          ...b.variants.map((variant) => getAttentionScore(variant.stockState, variant.totalStock)),
          100000
        );

        if (aScore !== bScore) return aScore - bScore;
        return a.name.localeCompare(b.name);
      })
      .filter((product) => product.variants.length > 0);
  }, [filterMode, inventory, searchQuery, showAttentionOnly, sortMode]);

  const handleQuantityDraftChange = (productSizeId: string, value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setDraftQuantities((prev) => ({
      ...prev,
      [productSizeId]: value,
    }));
  };

  const getDisplayedQuantity = (productSizeId: string, fallbackQuantity: number) => {
    return draftQuantities[productSizeId] ?? String(fallbackQuantity);
  };

  const handleSaveQuantity = async (productSizeId: string, fallbackQuantity: number) => {
    const draftValue = draftQuantities[productSizeId];
    const parsedQuantity =
      draftValue === undefined || draftValue === "" ? fallbackQuantity : Number.parseInt(draftValue, 10);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      toast.error("Quantity must be 0 or more.");
      return;
    }

    setSavingSizeIds((prev) => ({ ...prev, [productSizeId]: true }));

    try {
      const response = await fetch("/api/inventory/update-quantity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSizeId,
          quantity: parsedQuantity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update quantity.");
      }

      setDraftQuantities((prev) => {
        const next = { ...prev };
        delete next[productSizeId];
        return next;
      });

      toast.success("Stock quantity updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update quantity.");
    } finally {
      setSavingSizeIds((prev) => ({ ...prev, [productSizeId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border-2 bg-white p-5 shadow-sm">
          <p className="text-sm">Tracked Units</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalUnits}</p>
        </div>
        <div className="border-2 bg-white p-5 shadow-sm">
          <p className="text-sm">Tracked Variants</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalVariants}</p>
        </div>
        <div className="border-2 p-5 shadow-sm">
          <p className="text-sm text-amber-800">Low-Stock Variants</p>
          <p className="mt-3 text-3xl font-semibold text-amber-900">{lowStockVariants}</p>
        </div>
        <div className="border-2 p-5 shadow-sm">
          <p className="text-sm text-red-700">Out-of-Stock Variants</p>
          <p className="mt-3 text-3xl font-semibold text-red-900">{outOfStockVariants}</p>
        </div>
      </section>

      <section className="overflow-hidden border-2 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
            <p className="mt-1 text-sm text-slate-600">
              Keep an eye on size-level stock so you can restock before a variant disappears.
            </p>
          </div>

          <div className="mx-auto min-w-0 w-full max-w-4xl space-y-3">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by product, variant, SKU, category"
                className="w-full pl-10"
              />
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <Select
                value={filterMode}
                onChange={(event) => setFilterMode(event.target.value as FilterMode)}
                className="h-12 w-full min-w-0 rounded-none border-2 border-input bg-background px-3 text-sm"
              >
                <option value="all">All variants</option>
                <option value="healthy">Healthy only</option>
                <option value="low_stock">Low stock only</option>
                <option value="out_of_stock">Out of stock only</option>
              </Select>

              <Select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-12 w-full min-w-0 rounded-none border-2 border-input bg-background px-3 text-sm"
              >
                <option value="attention_first">Sort by lowest stock first</option>
                <option value="product_name">Sort alphabetically</option>
              </Select>

              <Button
                type="button"
                variant={showAttentionOnly ? "default" : "outline"}
                className="h-auto min-h-12 w-full border-2 whitespace-normal px-4 py-3 text-left md:col-span-2"
                onClick={() => setShowAttentionOnly((prev) => !prev)}
              >
                <ArrowDownUp className="size-4 shrink-0" />
                {showAttentionOnly ? "Showing attention only" : "Only show attention"}
              </Button>
            </div>
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
                            <Image
                              src={variant.mainImageUrl}
                              alt={variant.name}
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
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

                          <div className="flex flex-col gap-2">
                            {variant.sizeRows.map((sizeRow) => (
                              <div
                                key={sizeRow.id}
                                className="flex flex-col gap-3 border-2 bg-slate-50 px-3 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{sizeRow.sizeName}</span>
                                  <Badge variant="outline" className={getStockBadgeClasses(sizeRow.stockState)}>
                                    {sizeRow.stockState === "out_of_stock"
                                      ? "Out of Stock"
                                      : sizeRow.stockState === "low_stock"
                                        ? "Low Stock"
                                        : "Healthy"}
                                  </Badge>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={getDisplayedQuantity(sizeRow.id, sizeRow.quantity)}
                                    onChange={(event) =>
                                      handleQuantityDraftChange(sizeRow.id, event.target.value)
                                    }
                                    className="h-11 w-full min-w-[110px] bg-white sm:w-[120px]"
                                  />
                                  <Button
                                    type="button"
                                    className="border-2"
                                    disabled={savingSizeIds[sizeRow.id]}
                                    onClick={() => handleSaveQuantity(sizeRow.id, sizeRow.quantity)}
                                  >
                                    {savingSizeIds[sizeRow.id] ? "Saving..." : "Save Qty"}
                                  </Button>
                                </div>
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
                          <Button variant="outline" asChild className="border-2">
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
