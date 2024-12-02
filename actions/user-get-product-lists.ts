import { createClient } from "@/supabase/server";

export const userGetProductItems = async (query: string) => {
  const supabase = await createClient();

  try {
    // Step 1: Search in "brands_list"
    const { data: brands, error: brandError } = await supabase
      .from("brands_list")
      .select("id, name, logo_url")
      .ilike("name", `%${query}%`);

    if (brandError) throw new Error(`Brand query error: ${brandError.message}`);

    const brandResults = brands?.map((brand) => ({
      ...brand,
      source: "brand",
    })) || [];

    // Step 2.1: Search in "products_list"
    const { data: products, error: productError } = await supabase
      .from("products_list")
      .select("id, name, price")
      .ilike("name", `%${query}%`);

    if (productError) throw new Error(`Product query error: ${productError.message}`);

    const productIds = products?.map((product) => product.id) || [];
    const productResults = products?.map((product) => ({
      ...product,
      source: "product",
    })) || [];

    // Step 2.2: Fetch main images for the found products
    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("product_id, image_url")
      .in("product_id", productIds)
      .eq("is_main", true);

    if (imagesError) throw new Error(`Image query error: ${imagesError.message}`);

    const imageMap = new Map(
      imagesData?.map((image) => [image.product_id, image.image_url]) || []
    );

    const productsWithImages = productResults.map((product) => ({
      ...product,
      main_image_url: imageMap.get(product.id) || null,
    }));

    // Step 3: Search in "tags" and join with "product_tags" to get product IDs
    const { data: tags, error: tagError } = await supabase
      .from("tags")
      .select("id, name, product_tags(product_id)")
      .ilike("name", `%${query}%`);

    if (tagError) throw new Error(`Tag query error: ${tagError.message}`);

    const productIdsFromTags = tags?.flatMap((tag) =>
      tag.product_tags?.map((pt) => pt.product_id) || []
    ) || [];

    if (productIdsFromTags.length > 0) {
      // Fetch products for matching tags
      const { data: tagProducts, error: tagProductsError } = await supabase
        .from("products_list")
        .select("*")
        .in("id", productIdsFromTags);

      if (tagProductsError)
        throw new Error(`Tag product query error: ${tagProductsError.message}`);

      // Fetch images for products from tags
      const { data: tagImages, error: tagImagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url")
        .in("product_id", productIdsFromTags)
        .eq("is_main", true);

      if (tagImagesError)
        throw new Error(`Tag image query error: ${tagImagesError.message}`);

      const tagImageMap = new Map(
        tagImages?.map((image) => [image.product_id, image.image_url]) || []
      );

      const tagResults = tagProducts?.map((product) => ({
        ...product,
        main_image_url: tagImageMap.get(product.id) || null,
        source: "tag",
      })) || [];

      // Combine all results
      return [...brandResults, ...productsWithImages, ...tagResults];
    }

    // If no tags matched, return just brand and product results
    return [...brandResults, ...productsWithImages];
  } catch (error) {
    // Safely handle 'unknown' error type
    if (error instanceof Error) {
      console.error("Error fetching product items:", error.message);
      throw new Error(`Failed to fetch product items: ${error.message}`);
    }
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred");
  }
};
