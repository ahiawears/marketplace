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
        product_images:
          | {
              image_url: string | null;
              is_main: boolean | null;
            }[]
          | null;
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
): Promise<StorefrontProductCardData[]> {
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
        color_id(name, hex_code),
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

  const flattened = ((data || []) as ProductRow[]).flatMap((product) => {
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
        const color = readColor(variant.color_id);

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

  return flattened
    .filter((product) => {
      const matchesCategory =
        !normalizedCategory ||
        product.categoryName.toLowerCase() === normalizedCategory;

      const matchesGender =
        !normalizedGender ||
        product.genderName.toLowerCase() === normalizedGender;

      const matchesQuery =
        !normalizedQuery ||
        [
          product.productName,
          product.variantName,
          product.categoryName,
          product.genderName,
          product.colorName,
          product.sku,
          product.productCode,
          product.description,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesGender && matchesQuery;
    })
    .sort((a, b) => {
      const productCompare = a.productName.localeCompare(b.productName);
      if (productCompare !== 0) {
        return productCompare;
      }

      return a.variantName.localeCompare(b.variantName);
    });
}
