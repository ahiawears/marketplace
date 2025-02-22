import { createClient } from "@/supabase_change/server"

export const userGetProductDetail = async () => {
    const supabase = await createClient();
 
    const { data: productData, error: productError } = await supabase
        .from('products_list')
        .select();

    if (productError) {
        throw new Error('Failed to fetch products items');
    }

    if (!productData || productData.length === 0) {
        //return no products found
        return[];
    }

    const productIds = productData.map(product => product.id);
    const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds)
        .eq('is_main', true);

    if ( imagesError ) {
        throw new Error('Failed to fetch product images');
    }

    const imageMap = new Map(imagesData.map(image => {
        const filename = image.image_url.split('/').pop();

        const { data: publicUrlData } = supabase  
            .storage
            .from('product-images/products')
            .getPublicUrl(filename);

        return [image.product_id, publicUrlData?.publicUrl || null];
    }));

    const productsWithImages = productData.map( product => ({
        ...product, 
        main_image_url: imageMap.get(product.id) || null
    }));
    
    return productsWithImages;
}  