// @/actions/user-get-product-lists.ts

import { ProductListItemsDataType, tags, NestedRelationalField, ColorField, ProductImage } from "@/lib/types";
import { createClient } from "@/supabase/server";

interface ProductFilterCriteria {
    brandId?: string;
    category?: string;
    productType?: string;
    color?: string;
    material?: string;
    limit?: number;
    offset?: number;
}

export async function getProductList(filters: ProductFilterCriteria = {}): Promise<{ products: ProductListItemsDataType[], totalPublishedVariantsCount: number }> {
    const supabase = await createClient();

    // --- STEP 1: Determine the IDs of Published Products that match main filters ---
    // This is crucial for both fetching the products and getting an accurate count.
    let publishedProductIdsQuery = supabase
        .from('products_list')
        .select('id') // Only select the ID for efficiency
        .eq('is_published', true); // Only published products

    // Apply main product filters to this ID query
    if (filters.brandId) {
        publishedProductIdsQuery = publishedProductIdsQuery.eq('brand_id', filters.brandId);
    }
    if (filters.category) {
        publishedProductIdsQuery = publishedProductIdsQuery.eq('category_id', filters.category);
    }
    if (filters.productType) {
        publishedProductIdsQuery = publishedProductIdsQuery.eq('subcategory_id', filters.productType);
    }

    const { data: relevantPublishedProductIds, error: idsError } = await publishedProductIdsQuery;

    if (idsError) {
        console.error("Supabase fetch error (product IDs for count):", idsError);
        throw new Error(idsError.message || "Failed to fetch relevant product IDs.");
    }

    // If no products match the main filters and 'is_published: true', then no variants exist.
    if (!relevantPublishedProductIds || relevantPublishedProductIds.length === 0) {
        return { products: [], totalPublishedVariantsCount: 0 };
    }

    const productIds = relevantPublishedProductIds.map(item => item.id);

    // --- STEP 2: Count all variants for these published products ---
    let countQuery = supabase
        .from('product_variants')
        .select(`id`, { count: 'exact', head: true })
        .in('main_product_id', productIds); // Filter variants by the published product IDs

    // Apply variant-specific filters to the count query
    if (filters.color) {
        countQuery = countQuery.eq('color_id', filters.color);
    }
    if (filters.material) {
        countQuery = countQuery.eq('material_id', filters.material);
    }

    const { count: totalPublishedVariantsCount, error: countError } = await countQuery;

    if (countError) {
        console.error("Supabase fetch error (variant count):", countError);
        throw new Error(countError.message || "Failed to fetch total variant count.");
    }


    // --- STEP 3: Fetch the actual published products with their variants ---
    let productDetailsQuery = supabase
        .from('products_list')
        .select(`
            id,
            brand_id,
            category_id:category_id(name, id),
            name,
            product_description,
            subcategory_id:subcategory_id(name, id),
            material_id:material_id(name, id),
            currency_id:currency_id(name, id),
            season_id:season_id(name, id),
            gender_id:gender_id(name, id),
            product_tags(
                tags(id, name)
            ),
            is_published,
            product_variants(
                id,
                name,
                color_id(name, id, hex_code),
                sku,
                price,
                base_currency_price,
                product_code,
                color_description,
                product_images(id, image_url, is_main),
                images_description
            )
        `)
        .in('id', productIds); // Only fetch details for the relevant published products

    // Apply any variant-specific filters to the product details query if you want to filter the *returned variants*
    // within the nested array. Be aware this can be tricky.
    // If you apply them here, a product might still be returned if it has *other* variants that don't match.
    // Supabase usually filters the parent row if the child relation is filtered with `!inner`.
    // For direct nested filter, you'd do:
    if (filters.color) {
        productDetailsQuery = productDetailsQuery.filter('product_variants.color_id', 'eq', filters.color);
    }
    if (filters.material) {
        productDetailsQuery = productDetailsQuery.filter('product_variants.material_id', 'eq', filters.material);
    }


    // Apply pagination to the product details query
    if (filters.limit) {
        productDetailsQuery = productDetailsQuery.limit(filters.limit);
    }
    // if (filters.offset) {
    //     productDetailsQuery = productDetailsQuery.offset(filters.offset);
    // }

    const { data: productsData, error: productsError } = await productDetailsQuery;

    if (productsError) {
        console.error("Supabase fetch error (products details):", productsError);
        throw new Error(productsError.message || "Failed to fetch product details from database.");
    }

    if (!productsData) {
        return { products: [], totalPublishedVariantsCount: totalPublishedVariantsCount || 0 };
    }

    // --- STEP 4: Transform Product Data ---
    const transformedProducts: ProductListItemsDataType[] = productsData.map((item: any) => {
        const tagsArray: tags[] = item.product_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];

        // No need to filter by is_published here for variants,
        // because we already filtered the parent products by is_published:true
        // The `product_variants` array will only contain variants of published products.
        return {
            id: item.id,
            brand_id: item.brand_id,
            category_id: { id: item.category_id?.id, name: item.category_id?.name },
            name: item.name,
            product_description: item.product_description,
            subcategory: { id: item.subcategory_id?.id, name: item.subcategory_id?.name },
            material: { id: item.material_id?.id, name: item.material_id?.name },
            currency: { id: item.currency_id?.id, name: item.currency_id?.name },
            season: { id: item.season_id?.id, name: item.season_id?.name },
            gender: { id: item.gender_id?.id, name: item.gender_id?.name },
            is_published: item.is_published,
            product_tags: tagsArray,
            product_variants: item.product_variants.map((variant: any) => ({
                id: variant.id,
                name: variant.name,
                color_id: { id: variant.color_id?.id, name: variant.color_id?.name, hex_code: variant.color_id?.hex_code },
                sku: variant.sku,
                price: variant.price,
                base_currency_price: variant.base_currency_price,
                product_code: variant.product_code,
                color_description: variant.color_description,
                product_images: Array.isArray(variant.product_images) ? variant.product_images : (variant.product_images ? [variant.product_images].filter(Boolean) : []),
                images_description: variant.images_description,
            }))
        };
    });

    return { products: transformedProducts, totalPublishedVariantsCount: totalPublishedVariantsCount || 0 };
}