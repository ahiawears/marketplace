import { createClient } from "@/supabase/server";

export type InventorySizeRow = {
  sizeName: string;
  quantity: number;
  stockState: "out_of_stock" | "low_stock" | "healthy";
};

export type InventoryVariantRow = {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  mainImageUrl: string | null;
  name: string;
  sku: string;
  status: string;
  totalStock: number;
  stockState: "out_of_stock" | "low_stock" | "healthy";
  lowStockSizesCount: number;
  sizeRows: InventorySizeRow[];
};

export type InventoryProductGroup = {
  id: string;
  name: string;
  categoryName: string;
  totalStock: number;
  variantCount: number;
  outOfStockVariants: number;
  lowStockVariants: number;
  variants: InventoryVariantRow[];
};

type ProductRow = {
  id: string;
  name: string;
  category_id: string | null;
};

type VariantRow = {
  id: string;
  main_product_id: string;
  name: string | null;
  sku: string | null;
  status: string | null;
};

type ImageRow = {
  product_variant_id: string;
  image_url: string | null;
  is_main: boolean | null;
};

type ProductSizeRow = {
  product_id: string;
  quantity: number | null;
  size_id: { name: string | null } | null;
};

type CategoryRow = {
  id: string;
  name: string | null;
};

const LOW_STOCK_SIZE_THRESHOLD = 3;
const LOW_STOCK_VARIANT_THRESHOLD = 5;

function getSizeStockState(quantity: number): InventorySizeRow["stockState"] {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= LOW_STOCK_SIZE_THRESHOLD) return "low_stock";
  return "healthy";
}

function getVariantStockState(totalStock: number): InventoryVariantRow["stockState"] {
  if (totalStock <= 0) return "out_of_stock";
  if (totalStock <= LOW_STOCK_VARIANT_THRESHOLD) return "low_stock";
  return "healthy";
}

export async function getBrandInventory(brandId: string): Promise<InventoryProductGroup[]> {
  const supabase = await createClient();

  const { data: productsData, error: productsError } = await supabase
    .from("products_list")
    .select("id, name, category_id")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching brand inventory products:", productsError);
    throw new Error("Failed to fetch inventory products.");
  }

  const products = (productsData || []) as ProductRow[];
  if (products.length === 0) return [];

  const productIds = products.map((product) => product.id);
  const categoryIds = Array.from(
    new Set(products.map((product) => product.category_id).filter(Boolean))
  ) as string[];

  const [
    { data: categoriesData, error: categoriesError },
    { data: variantsData, error: variantsError },
  ] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("product_variants")
      .select("id, main_product_id, name, sku, status")
      .in("main_product_id", productIds)
      .order("display_order", { ascending: true }),
  ]);

  if (categoriesError) {
    console.error("Error fetching inventory categories:", categoriesError);
    throw new Error("Failed to fetch inventory categories.");
  }

  if (variantsError) {
    console.error("Error fetching inventory variants:", variantsError);
    throw new Error("Failed to fetch inventory variants.");
  }

  const variants = (variantsData || []) as VariantRow[];
  const variantIds = variants.map((variant) => variant.id);

  const [
    { data: imagesData, error: imagesError },
    { data: sizesData, error: sizesError },
  ] = await Promise.all([
    variantIds.length > 0
      ? supabase
          .from("product_images")
          .select("product_variant_id, image_url, is_main")
          .in("product_variant_id", variantIds)
      : Promise.resolve({ data: [], error: null }),
    variantIds.length > 0
      ? supabase
          .from("product_sizes")
          .select("product_id, quantity, size_id(name)")
          .in("product_id", variantIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (imagesError) {
    console.error("Error fetching inventory images:", imagesError);
    throw new Error("Failed to fetch inventory images.");
  }

  if (sizesError) {
    console.error("Error fetching inventory sizes:", sizesError);
    throw new Error("Failed to fetch inventory sizes.");
  }

  const categoryMap = new Map(
    ((categoriesData || []) as CategoryRow[]).map((category) => [
      category.id,
      category.name || "Uncategorized",
    ])
  );

  const imagesByVariant = new Map<string, ImageRow[]>();
  for (const image of (imagesData || []) as ImageRow[]) {
    const current = imagesByVariant.get(image.product_variant_id) || [];
    current.push(image);
    imagesByVariant.set(image.product_variant_id, current);
  }

  const sizeRowsByVariant = new Map<string, InventorySizeRow[]>();
  for (const size of (sizesData || []) as ProductSizeRow[]) {
    const sizeName = size.size_id?.name || "Unspecified";
    const quantity = size.quantity ?? 0;
    const current = sizeRowsByVariant.get(size.product_id) || [];
    current.push({
      sizeName,
      quantity,
      stockState: getSizeStockState(quantity),
    });
    sizeRowsByVariant.set(size.product_id, current);
  }

  const variantsByProduct = new Map<string, InventoryVariantRow[]>();
  for (const variant of variants) {
    const sizeRows = (sizeRowsByVariant.get(variant.id) || []).sort((a, b) =>
      a.sizeName.localeCompare(b.sizeName)
    );
    const totalStock = sizeRows.reduce((sum, row) => sum + row.quantity, 0);
    const lowStockSizesCount = sizeRows.filter((row) => row.stockState === "low_stock").length;
    const variantImages = imagesByVariant.get(variant.id) || [];
    const mainImage =
      variantImages.find((image) => image.is_main)?.image_url ||
      variantImages[0]?.image_url ||
      null;

    const current = variantsByProduct.get(variant.main_product_id) || [];
    current.push({
      id: variant.id,
      productId: variant.main_product_id,
      productName: "",
      categoryName: "",
      mainImageUrl: mainImage,
      name: variant.name || "Untitled variant",
      sku: variant.sku || "",
      status: variant.status || "inactive",
      totalStock,
      stockState: getVariantStockState(totalStock),
      lowStockSizesCount,
      sizeRows,
    });
    variantsByProduct.set(variant.main_product_id, current);
  }

  return products.map((product) => {
    const categoryName = product.category_id
      ? categoryMap.get(product.category_id) || "Uncategorized"
      : "Uncategorized";
    const variantsForProduct = (variantsByProduct.get(product.id) || []).map((variant) => ({
      ...variant,
      productName: product.name,
      categoryName,
    }));
    const totalStock = variantsForProduct.reduce((sum, variant) => sum + variant.totalStock, 0);
    const outOfStockVariants = variantsForProduct.filter(
      (variant) => variant.stockState === "out_of_stock"
    ).length;
    const lowStockVariants = variantsForProduct.filter(
      (variant) => variant.stockState === "low_stock"
    ).length;

    return {
      id: product.id,
      name: product.name,
      categoryName,
      totalStock,
      variantCount: variantsForProduct.length,
      outOfStockVariants,
      lowStockVariants,
      variants: variantsForProduct,
    };
  });
}
