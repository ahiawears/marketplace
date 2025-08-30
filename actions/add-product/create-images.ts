export async function createImages(supabase: any, variantId: string, variantImages: File, index: number) {
    try {
        const imageUrls: string[] = [];
        const bucketName = "product-images";
        
        const uniqueFileName = `${variantId}/image-${index}.${variantImages.type.split("/")[1] || "png"}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(`products/${uniqueFileName}`, variantImages, {
                upsert: true,
                contentType: variantImages.type
            });

        if (error) {
            throw new Error(`Error uploading image: ${error.message}`);
        }

        // Get public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`products/${uniqueFileName}`);

        if (!publicUrlData.publicUrl) {
            throw new Error(`Error getting public URL`);
        }

        const publicUrl = publicUrlData.publicUrl;

        console.log("The public url is: ", publicUrl);
        imageUrls.push(publicUrl);

        // Determine if this image is the main image (first image)
        const isMain = index === 0;

        // Insert the image URL into the `product_images` table
        const { error: imageInsertionError } = await supabase
            .from("product_images")
            .insert({
                product_variant_id: variantId,
                image_url: publicUrl,
                is_main: isMain, // First image will be marked as main
            });

        if (imageInsertionError) {
            throw new Error(`Error adding image to product_images table: ${imageInsertionError.message}`);
        }

        console.log("Images uploaded successfully:", imageUrls);
        return imageUrls;
    } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
    }
} 