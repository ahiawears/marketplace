import { createClient } from "@/supabase/server";
import { ProductTableType } from "@/lib/types";

type ProductRow = {
    id: string;
    name: string;
    category_id: string | null;
    subcategory_id: string | null;
    season_id: string | null;
};

type VariantRow = {
    id: string;
    main_product_id: string;
    name: string | null;
    sku: string | null;
    price: number | null;
    product_code: string | null;
    status: string | null;
    slug: string | null;
    available_date: string | null;
};

type CategoryRow = { id: string; name: string | null };
type SubcategoryRow = { id: string; name: string | null };
type SeasonRow = { id: string; name: string | null };
type ImageRow = { product_variant_id: string; image_url: string | null; is_main: boolean | null };
type VariantColorRow = {
    product_variant_id: string | null;
    color_id: { name: string | null } | null;
};
type ProductSizeRow = {
    product_id: string;
    quantity: number | null;
    size_id: { name: string | null } | null;
};

export const getProductItems = async (brandId: string): Promise<ProductTableType[]> => {
    const supabase = await createClient();

    const { data: productData, error: productError } = await supabase
        .from("products_list")
        .select("id, name, category_id, subcategory_id, season_id")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

    if (productError) {
        console.error("Error fetching products items:", productError);
        throw new Error("Failed to fetch products items");
    }

    if (!productData || productData.length === 0) {
        return [];
    }

    const products = productData as ProductRow[];
    const categoryIds = Array.from(new Set(products.map((product) => product.category_id).filter(Boolean))) as string[];
    const subcategoryIds = Array.from(new Set(products.map((product) => product.subcategory_id).filter(Boolean))) as string[];
    const seasonIds = Array.from(new Set(products.map((product) => product.season_id).filter(Boolean))) as string[];
    const productIds = products.map((product) => product.id);

    const [
        { data: categoriesData, error: categoriesError },
        { data: subcategoriesData, error: subcategoriesError },
        { data: seasonsData, error: seasonsError },
        { data: variantsData, error: variantsError },
    ] =
        await Promise.all([
            categoryIds.length > 0
                ? supabase.from("categories").select("id, name").in("id", categoryIds)
                : Promise.resolve({ data: [], error: null }),
            subcategoryIds.length > 0
                ? supabase.from("subcategories").select("id, name").in("id", subcategoryIds)
                : Promise.resolve({ data: [], error: null }),
            seasonIds.length > 0
                ? supabase.from("product_season").select("id, name").in("id", seasonIds)
                : Promise.resolve({ data: [], error: null }),
            supabase
                .from("product_variants")
                .select("id, main_product_id, name, sku, price, product_code, status, slug, available_date")
                .in("main_product_id", productIds)
                .order("display_order", { ascending: true }),
        ]);

    if (categoriesError) {
        console.error("Error fetching product categories:", categoriesError);
        throw new Error("Failed to fetch product categories");
    }

    if (subcategoriesError) {
        console.error("Error fetching product subcategories:", subcategoriesError);
        throw new Error("Failed to fetch product subcategories");
    }

    if (seasonsError) {
        console.error("Error fetching product seasons:", seasonsError);
        throw new Error("Failed to fetch product seasons");
    }

    if (variantsError) {
        console.error("Error fetching product variants:", variantsError);
        throw new Error("Failed to fetch product variants");
    }

    const variants = (variantsData || []) as VariantRow[];
    const variantIds = variants.map((variant) => variant.id);

    const [{ data: imagesData, error: imagesError }, { data: variantColorsData, error: variantColorsError }, { data: sizesData, error: sizesError }] =
        await Promise.all([
            variantIds.length > 0
                ? supabase
                    .from("product_images")
                    .select("product_variant_id, image_url, is_main")
                    .in("product_variant_id", variantIds)
                : Promise.resolve({ data: [], error: null }),
            variantIds.length > 0
                ? supabase
                    .from("product_variant_colors")
                    .select("product_variant_id, color_id(name)")
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
        console.error("Error fetching product images:", imagesError);
        throw new Error("Failed to fetch product images");
    }

    if (variantColorsError) {
        console.error("Error fetching variant colors:", variantColorsError);
        throw new Error("Failed to fetch variant colors");
    }

    if (sizesError) {
        console.error("Error fetching product sizes:", sizesError);
        throw new Error("Failed to fetch product sizes");
    }

    const categoryMap = new Map(((categoriesData || []) as CategoryRow[]).map((row) => [row.id, row.name || "Unknown Category"]));
    const subcategoryMap = new Map(((subcategoriesData || []) as SubcategoryRow[]).map((row) => [row.id, row.name || "Unknown Subcategory"]));
    const seasonMap = new Map(((seasonsData || []) as SeasonRow[]).map((row) => [row.id, row.name || "Unspecified"]));

    const imagesByVariant = new Map<string, ImageRow[]>();
    for (const image of ((imagesData || []) as ImageRow[])) {
        const current = imagesByVariant.get(image.product_variant_id) || [];
        current.push(image);
        imagesByVariant.set(image.product_variant_id, current);
    }

    const colorsByVariant = new Map<string, string[]>();
    for (const entry of ((variantColorsData || []) as VariantColorRow[])) {
        if (!entry.product_variant_id || !entry.color_id?.name) continue;
        const current = colorsByVariant.get(entry.product_variant_id) || [];
        current.push(entry.color_id.name);
        colorsByVariant.set(entry.product_variant_id, Array.from(new Set(current)));
    }

    const sizesByVariant = new Map<string, string[]>();
    for (const size of ((sizesData || []) as ProductSizeRow[])) {
        const sizeName = size.size_id?.name;
        if (!sizeName) continue;
        const quantity = size.quantity ?? 0;
        const current = sizesByVariant.get(size.product_id) || [];
        current.push(`${sizeName} (${quantity})`);
        sizesByVariant.set(size.product_id, current);
    }

    const variantsByProduct = new Map<string, ProductTableType["variants"]>();
    for (const variant of variants) {
        const variantImages = imagesByVariant.get(variant.id) || [];
        const mainImage = variantImages.find((image) => image.is_main) || variantImages[0];
        const current = variantsByProduct.get(variant.main_product_id) || [];

        current.push({
            id: variant.id,
            name: variant.name || "Untitled variant",
            sku: variant.sku || "",
            productCode: variant.product_code || "",
            price: variant.price,
            status: variant.status || "inactive",
            slug: variant.slug || "",
            availableDate: variant.available_date,
            colorSummary: (colorsByVariant.get(variant.id) || []).join(", "),
            sizeSummary: (sizesByVariant.get(variant.id) || []).join(", "),
            mainImageUrl: mainImage?.image_url || null,
        });

        variantsByProduct.set(variant.main_product_id, current);
    }

    return products.map((product) => {
        const mappedVariants = variantsByProduct.get(product.id) || [];
        return {
            id: product.id,
            name: product.name,
            category_name: product.category_id ? categoryMap.get(product.category_id) || "Unknown Category" : "Unknown Category",
            subCategory: product.subcategory_id ? subcategoryMap.get(product.subcategory_id) || "Unknown Subcategory" : "Unknown Subcategory",
            season: product.season_id ? seasonMap.get(product.season_id) || "Unspecified" : "Unspecified",
            variantCount: mappedVariants.length,
            variants: mappedVariants,
        };
    });
};
