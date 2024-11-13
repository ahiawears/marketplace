import { createClient } from "@/supabase/server";

export const getProductItems = async (userId: string) => { //change this to brandId
    const supabase = await createClient();
    
    const { data: productData, error: productError } = await supabase
        .from('products_list')
        .select('*, category_id')
        .eq('brand_id', userId); //replace userId with brandId 

    console.log("Fetched Data:", productData);
    console.log("Fetch Error:", productError);

    if (productError) {
        console.error("Error fetching products items:", productError);
        throw new Error('Failed to fetch products items');
    }  

    if (!productData || productData.length === 0) {
        console.log("No products items found for user:", userId);
        return []; 
    }

    const categoryIds = productData.map(item => item.category_id);
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

    if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw new Error('Failed to fetch categories');
    }

    // Step 3: Map category names to products
    const categoryMap = new Map(categoriesData.map(category => [category.id, category.name]));
    const productsWithCategoryNames = productData.map(product => ({
        ...product,
        category_name: categoryMap.get(product.category_id) || 'Unknown Category'  
    }));

    // Get product IDs for fetching main images
    const productIds = productData.map(product => product.id);

    // Fetch main images for products
    const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds) 
        .eq('is_main', true);

    if (imagesError) {
        console.error("Error fetching product images:", imagesError);
        throw new Error('Failed to fetch product images');
    }

    // Map main images to products using Supabase's getPublicUrl
    const imageMap = new Map(imagesData.map(image => {
        // Extract only the filename from the full URL
        const filename = image.image_url.split('/').pop();  // Get the last part of the path
      
        // Fetch the public URL for the image using the filename
        const { data: publicUrlData } = supabase
            .storage
            .from('product-images/products')
            .getPublicUrl(filename); // Use the filename now
      
        console.log("The image publicURL is: ", publicUrlData?.publicUrl )
        return [image.product_id, publicUrlData?.publicUrl || null];
      }));

    const productsWithImages = productsWithCategoryNames.map(product => ({
        ...product,
        main_image_url: imageMap.get(product.id) || null
    })); 

    // Console log each product with its main image for debugging
    productsWithImages.forEach(product => {
        console.log(`Product: ${product.name}, Main Image URL: ${product.main_image_url}`);
    });

    return productsWithImages;
};
