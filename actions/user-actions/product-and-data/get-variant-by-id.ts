import { createClient } from "@/supabase/server";

interface SizeData {
  id: string;
  size_id: { name: string };
  quantity: number;
  product_measurements?: Array<{
    measurement_type_id: { name: string };
    value: number;
    measurement_unit: string;
  }>;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_main: boolean;
}

interface SizeDetails {
  quantity: number;
  measurements: {
    type: string;
    value: number;
    unit: string;
  }[];
}

interface Tag {
  tag_id: {
    name: string;
  };
}

interface RelatedVariant {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
}

type TagRow = {
  tag_id:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

interface VariantRow {
  id: string;
  slug: string | null;
  main_product_id: string;
  name: string;
  sku: string;
  price: number;
  base_currency_price: number;
  product_code: string;
  color_description: string;
  images_description: string;
  product_images: ProductImage[];
}

interface VariantResponseData extends VariantRow {
  color_id: Color | null;
  relatedVariantIds: string[];
  relatedVariants: RelatedVariant[];
  tags: Tag[] | null;
  sizes: Record<string, SizeDetails>;
}

interface VariantResponse {
  success: boolean;
  data: VariantResponseData | null;
  error: string | null;
}

type VariantLookupField = "id" | "slug";
type VariantColorRow = {
  color_id: Color | null;
};
type RelatedVariantRow = {
  id: string;
  slug: string | null;
  name: string;
  product_images?: ProductImage[] | null;
};

const errorResponse = (message: string): VariantResponse =>
  JSON.parse(JSON.stringify({ error: message, data: null, success: false }));

const successResponse = (data: VariantResponseData): VariantResponse =>
  JSON.parse(JSON.stringify({ error: null, data, success: true }));

async function getVariantByField(field: VariantLookupField, value: string): Promise<VariantResponse> {
  const supabase = await createClient();

  try {
    const { data, error: variantError } = await supabase
      .from("product_variants")
      .select(`
        id,
        slug,
        main_product_id,
        name,
        sku,
        price,
        base_currency_price,
        product_code,
        color_description,
        product_images(id, image_url, is_main),
        images_description
      `)
      .eq(field, value)
      .single();

    if (variantError) {
      throw new Error(variantError.message || "Could not fetch product details.");
    }

    if (!data) {
      return { success: false, data: null, error: "Not found" };
    }

    const variant = data as VariantRow;

    const [{ data: colorData }, { data: relatedVariants }, { data: tagData }, { data: sizes }] = await Promise.all([
      supabase
        .from("product_variant_colors")
        .select("color_id(name, id, hex_code)")
        .eq("product_variant_id", variant.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("product_variants")
        .select(`
          id,
          slug,
          name,
          product_images(id, image_url, is_main)
        `)
        .eq("main_product_id", variant.main_product_id)
        .neq("id", variant.id),
      supabase
        .from("product_tags")
        .select("tag_id(name)")
        .eq("product_id", variant.main_product_id),
      supabase
        .from("product_sizes")
        .select(`
          id,
          size_id(name),
          quantity,
          product_measurements(
            measurement_type_id(name),
            value,
            measurement_unit
          )
        `)
        .eq("product_id", variant.id),
    ]);

    const typedSizes = (sizes || []) as unknown as SizeData[];
    const variantColor = (colorData as VariantColorRow | null)?.color_id || null;
    const normalizedRelatedVariants = ((relatedVariants || []) as RelatedVariantRow[])
      .filter((relatedVariant) => relatedVariant.slug)
      .map((relatedVariant) => {
        const mainImage =
          relatedVariant.product_images?.find((image) => image.is_main) ||
          relatedVariant.product_images?.[0] ||
          null;

        return {
          id: relatedVariant.id,
          slug: relatedVariant.slug as string,
          name: relatedVariant.name,
          image_url: mainImage?.image_url || null,
        } satisfies RelatedVariant;
      });
    const normalizedTags = ((tagData || []) as TagRow[])
      .map((tag) => {
        if (!tag.tag_id) {
          return null;
        }

        const tagName = Array.isArray(tag.tag_id) ? tag.tag_id[0]?.name : tag.tag_id.name;
        if (!tagName) {
          return null;
        }

        return {
          tag_id: {
            name: tagName,
          },
        } satisfies Tag;
      })
      .filter((tag): tag is Tag => Boolean(tag));

    const sizesStructured = typedSizes.reduce((acc, size) => {
      const sizeName = size.size_id.name;
      acc[sizeName] = {
        quantity: size.quantity,
        measurements:
          size.product_measurements?.map((measurement) => ({
            type: measurement.measurement_type_id.name,
            value: measurement.value,
            unit: measurement.measurement_unit,
          })) || [],
      };
      return acc;
    }, {} as Record<string, SizeDetails>);

    return successResponse({
      ...variant,
      color_id: variantColor,
      relatedVariantIds: normalizedRelatedVariants.map((relatedVariant) => relatedVariant.id),
      relatedVariants: normalizedRelatedVariants,
      tags: normalizedTags.length > 0 ? normalizedTags : null,
      sizes: sizesStructured,
    });
  } catch (error) {
    console.error("Error in variant lookup:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error occurred");
  }
}

export const getVariantById = async (variantId: string): Promise<VariantResponse> =>
  getVariantByField("id", variantId);

export const getVariantBySlug = async (variantSlug: string): Promise<VariantResponse> =>
  getVariantByField("slug", variantSlug);
