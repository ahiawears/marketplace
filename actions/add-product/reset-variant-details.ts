export async function resetVariantDetails(supabase: any, variantId: string) {
    const bucketName = "product-images";
    const { data: existingImages, error: fetchImagesError } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_variant_id", variantId);

    if (fetchImagesError) {
        throw fetchImagesError;
    }

    const storagePaths = (existingImages || [])
        .map((image: { image_url: string | null }) => {
            if (!image.image_url) {
                return null;
            }

            try {
                const url = new URL(image.image_url);
                const marker = `/object/public/${bucketName}/`;
                const markerIndex = url.pathname.indexOf(marker);

                if (markerIndex === -1) {
                    return null;
                }

                return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
            } catch {
                return null;
            }
        })
        .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
            .from(bucketName)
            .remove(storagePaths);

        if (storageDeleteError) {
            throw storageDeleteError;
        }
    }

    const { error: deleteImagesError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_variant_id", variantId);

    if (deleteImagesError) {
        throw deleteImagesError;
    }

    const { error: deleteColorsError } = await supabase
        .from("product_variant_colors")
        .delete()
        .eq("product_variant_id", variantId);

    if (deleteColorsError) {
        throw deleteColorsError;
    }

    const { error: deleteMaterialsError } = await supabase
        .from("product_variant_materials")
        .delete()
        .eq("product_variant_id", variantId);

    if (deleteMaterialsError) {
        throw deleteMaterialsError;
    }

    const { error: deleteTagsError } = await supabase
        .from("product_variant_tags")
        .delete()
        .eq("product_variant_id", variantId);

    if (deleteTagsError) {
        throw deleteTagsError;
    }

    const { error: deleteSizesError } = await supabase
        .from("product_sizes")
        .delete()
        .eq("product_id", variantId);

    if (deleteSizesError) {
        throw deleteSizesError;
    }
}
