import { createClient } from "@/supabase/server";

export interface StorefrontProductCardData {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  categoryName: string;
  genderName: string;
  description: string;
  price: number | null;
  sku: string;
  productCode: string;
  colorName: string;
  colorHex: string;
  imageUrl: string | null;
  gallery: string[];
}

interface StorefrontProductFilters {
  query?: string;
  category?: string;
  gender?: string;
}

export interface StorefrontProductSearchResult {
  products: StorefrontProductCardData[];
  matchedCategories: string[];
  exactCategoryMatch: string | null;
}

type ProductRow = {
  id: string;
  name: string | null;
  product_description: string | null;
  category_id:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
  gender_id:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
  product_variants:
    | {
        id: string;
        name: string | null;
        sku: string | null;
        product_code: string | null;
        price: number | null;
        status: string | null;
        available_date: string | null;
        product_images:
          | {
              image_url: string | null;
              is_main: boolean | null;
            }[]
          | null;
      }[]
    | null;
};

type VariantColorRow = {
  product_variant_id: string | null;
  color_id:
    | {
        name: string | null;
        hex_code: string | null;
      }
    | {
        name: string | null;
        hex_code: string | null;
      }[]
    | null;
};

function readRelationName(
  relation:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null
) {
  if (!relation) {
    return "";
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name || "";
  }

  return relation.name || "";
}

function readColor(
  relation:
    | {
        name: string | null;
        hex_code: string | null;
      }
    | {
        name: string | null;
        hex_code: string | null;
      }[]
    | null
) {
  if (!relation) {
    return { name: "", hex: "" };
  }

  if (Array.isArray(relation)) {
    return {
      name: relation[0]?.name || "",
      hex: relation[0]?.hex_code || "",
    };
  }

  return {
    name: relation.name || "",
    hex: relation.hex_code || "",
  };
}

export async function getStorefrontProducts(
  filters: StorefrontProductFilters = {}
): Promise<StorefrontProductSearchResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products_list")
    .select(`
      id,
      name,
      product_description,
      category_id(name),
      gender_id(name),
      product_variants(
        id,
        name,
        sku,
        product_code,
        price,
        status,
        available_date,
        product_images(image_url, is_main)
      )
    `)
    .eq("is_published", true);

  if (error) {
    throw new Error(error.message || "Failed to load storefront products.");
  }

  const normalizedQuery = filters.query?.trim().toLowerCase() || "";
  const normalizedCategory = filters.category?.trim().toLowerCase() || "";
  const normalizedGender = filters.gender?.trim().toLowerCase() || "";
  const now = new Date();

  const productRows = (data || []) as ProductRow[];
  const variantIds = productRows.flatMap((product) =>
    (product.product_variants || []).map((variant) => variant.id)
  );

  const { data: colorData, error: colorError } =
    variantIds.length > 0
      ? await supabase
          .from("product_variant_colors")
          .select("product_variant_id, color_id(name, hex_code)")
          .in("product_variant_id", variantIds)
      : { data: [], error: null };

  if (colorError) {
    throw new Error(colorError.message || "Failed to load storefront variant colors.");
  }

  const colorsByVariant = new Map<string, ReturnType<typeof readColor>>();
  for (const row of (colorData || []) as VariantColorRow[]) {
    if (!row.product_variant_id) {
      continue;
    }

    const existing = colorsByVariant.get(row.product_variant_id);
    if (existing?.name) {
      continue;
    }

    colorsByVariant.set(row.product_variant_id, readColor(row.color_id));
  }

  const flattened = productRows.flatMap((product) => {
    const productName = product.name || "Untitled Product";
    const description = product.product_description || "";
    const categoryName = readRelationName(product.category_id);
    const genderName = readRelationName(product.gender_id);

    return (product.product_variants || [])
      .filter((variant) => {
        const isActive = variant.status === null || variant.status === "active";
        if (!isActive) {
          return false;
        }

        if (!variant.available_date) {
          return true;
        }

        const availableDate = new Date(variant.available_date);
        if (Number.isNaN(availableDate.getTime())) {
          return true;
        }

        return availableDate <= now;
      })
      .map<StorefrontProductCardData>((variant) => {
        const images = (variant.product_images || [])
          .map((image) => image.image_url)
          .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
        const mainImage =
          (variant.product_images || []).find((image) => image.is_main)?.image_url ||
          images[0] ||
          null;
        const color = colorsByVariant.get(variant.id) || { name: "", hex: "" };

        return {
          variantId: variant.id,
          productId: product.id,
          productName,
          variantName: variant.name || productName,
          categoryName,
          genderName,
          description,
          price: variant.price,
          sku: variant.sku || "",
          productCode: variant.product_code || "",
          colorName: color.name,
          colorHex: color.hex,
          imageUrl: mainImage,
          gallery: images,
        };
      });
  });

  const availableCategories = Array.from(
    new Set(
      flattened
        .map((product) => product.categoryName.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const matchedCategories = normalizedQuery
    ? availableCategories.filter((categoryName) =>
        categoryName.toLowerCase().includes(normalizedQuery)
      )
    : normalizedCategory
      ? availableCategories.filter(
          (categoryName) => categoryName.toLowerCase() === normalizedCategory
        )
      : [];

  const exactCategoryMatch =
    matchedCategories.find(
      (categoryName) => categoryName.toLowerCase() === normalizedQuery
    ) ||
    availableCategories.find(
      (categoryName) => categoryName.toLowerCase() === normalizedCategory
    ) ||
    null;

  const scored = flattened
    .filter((product) => {
      const categoryValue = product.categoryName.toLowerCase();
      const productValue = product.productName.toLowerCase();
      const variantValue = product.variantName.toLowerCase();
      const genderValue = product.genderName.toLowerCase();

      const matchesCategory =
        !normalizedCategory || categoryValue === normalizedCategory;

      const matchesGender =
        !normalizedGender || genderValue === normalizedGender;

      const matchesQuery =
        !normalizedQuery ||
        [
          productValue,
          variantValue,
          categoryValue,
          genderValue,
          product.colorName.toLowerCase(),
          product.sku.toLowerCase(),
          product.productCode.toLowerCase(),
          product.description.toLowerCase(),
        ].some((value) => value.includes(normalizedQuery));

      return matchesCategory && matchesGender && matchesQuery;
    })
    .map((product) => {
      const productValue = product.productName.toLowerCase();
      const variantValue = product.variantName.toLowerCase();
      const categoryValue = product.categoryName.toLowerCase();
      const colorValue = product.colorName.toLowerCase();
      const descriptionValue = product.description.toLowerCase();
      const skuValue = product.sku.toLowerCase();
      const productCodeValue = product.productCode.toLowerCase();

      let score = 0;

      if (normalizedCategory && categoryValue === normalizedCategory) {
        score += 180;
      }

      if (normalizedQuery) {
        if (categoryValue === normalizedQuery) score += 160;
        else if (categoryValue.startsWith(normalizedQuery)) score += 110;
        else if (categoryValue.includes(normalizedQuery)) score += 80;

        if (productValue === normalizedQuery) score += 150;
        else if (productValue.startsWith(normalizedQuery)) score += 120;
        else if (productValue.includes(normalizedQuery)) score += 95;

        if (variantValue === normalizedQuery) score += 140;
        else if (variantValue.startsWith(normalizedQuery)) score += 105;
        else if (variantValue.includes(normalizedQuery)) score += 85;

        if (colorValue.includes(normalizedQuery)) score += 35;
        if (skuValue.includes(normalizedQuery)) score += 25;
        if (productCodeValue.includes(normalizedQuery)) score += 25;
        if (descriptionValue.includes(normalizedQuery)) score += 10;
      }

      return { product, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const productCompare = a.product.productName.localeCompare(b.product.productName);
      if (productCompare !== 0) {
        return productCompare;
      }

      return a.product.variantName.localeCompare(b.product.variantName);
    });

  const products = scored.map((entry) => entry.product);

  return {
    products,
    matchedCategories,
    exactCategoryMatch,
  };
}
