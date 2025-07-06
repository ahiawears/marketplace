// deno-lint-ignore-file
// Setup type definitions for built-in Supabase Runtime APIs
import { createGender } from "@actions/create-gender.ts";
import { createSeason } from "@actions/create-season.ts";
import { createCategory } from "@actions/create-category.ts";
import { createCurrency } from "@actions/create-currency.ts"; 
import { createTags } from "@actions/create-tags.ts";
import { createProduct } from "@actions/create-general-details.ts"; 
import { createMaterial } from "@actions/create-material.ts";  
import { createSubCategory } from "@actions/create-subCategory.ts";
import { createColor } from "@actions/create-color.ts";
import { createVariant } from "@actions/create-variant.ts";
import { createSizes } from "@actions/create-sizes.ts";
import { createImages } from "@actions/create-images.ts";
import { createProductShippingDetails } from "@actions/create-shipping-details.ts";
import validator from "npm:validator";
import { createClient } from "../../server-deno.ts";  
import { corsHeaders } from '../_shared/cors.ts';
import { validateGeneralProductDetails, GeneralDetails as ValidationGeneralDetails, GeneralDetailsErrors } from "../_shared/product-data-validation.ts"; // Import validation
import { GetExchangeRates } from '@hooks/get-exchange-rate.ts';

interface ParsedEdgeVariant {
    variantName: string;
    sku: string;
    price: string;
    colorName: string;
    productCode: string;
    colorDescription: string;
    mainColor: string;
    measurementUnit: string;
    measurements: { 
        [size: string]: { 
            [measurement: string]: number; 
            quantity: number; 
        } 
    };
    availableDate?: string;
    imagesDescription?: string;
    colorHexes?: string[];
}

interface RequestGeneralDetails {
    productName: string;
    productDescription: string;
    category: string;
    subCategory: string;
    tags: string[];
    currency: string;
    material: string;
    season: string;
    gender: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response('ok', { headers: corsHeaders });
    }
    
    try {
        // Authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) { 
            return new Response(
                JSON.stringify({ success: false, message: "Missing Authorization header" }),
                { status: 401, headers: corsHeaders }
            );
        }

        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            return new Response(
                JSON.stringify({ success: false, message: "Malformed Authorization header" }),
                { status: 401, headers: corsHeaders }
            );
        }

        const supabase = createClient(accessToken);

        // Authenticate user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not authenticated" }),
                { status: 401, headers: corsHeaders }
            );
        }
    
        // Validate content type
        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid content type. Expected multipart/form-data." }),
                { status: 400, headers: corsHeaders }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const operation = formData.get('operation');

        switch (operation) {
            // Process general details
            case 'ProductGeneralData': 
                const generalDetailsRaw = formData.get('generalDetails');
                if (!generalDetailsRaw || typeof generalDetailsRaw !== 'string') {
                    return new Response(
                        JSON.stringify({ 
                            success: false, 
                            message: "Missing or invalid generalDetails" 
                        }),
                        { status: 400, headers: corsHeaders }
                    );
                }
                console.log("General Details backend data", JSON.stringify(generalDetailsRaw));

                let generalDetails: ValidationGeneralDetails;
                try {
                    generalDetails = JSON.parse(generalDetailsRaw);

                } catch (error) {
                    return new Response(
                        JSON.stringify({ success: false, message: "Invalid JSON in generalDetails" }),
                        { status: 400, headers: corsHeaders }
                    );
                }
                const validationErrors: GeneralDetailsErrors = validateGeneralProductDetails(generalDetails);
                if (!validationErrors._isValid) {
                    return new Response(
                        JSON.stringify({ success: false, message: "Validation failed", errors: validationErrors }),
                        { status: 400, headers: corsHeaders }
                    );
                }

                // Insert General Details into database
                const genderId = await createGender(supabase, generalDetails.gender); 
                const seasonId = await createSeason(supabase, generalDetails.season); 
                const categoryId = await createCategory(supabase, generalDetails.category);
                const subCategoryId = await createSubCategory(supabase, generalDetails.subCategory, categoryId);
                const materialId = await createMaterial(supabase, generalDetails.material);
                const currencyId = await createCurrency(supabase, generalDetails.currency);
                const productUploadId = await createProduct(
                    supabase, 
                    categoryId, 
                    subCategoryId,
                    materialId,
                    generalDetails.productDescription,
                    generalDetails.productName, 
                    currencyId, 
                    genderId, 
                    seasonId,
                    user.id,
                )

                await createTags(supabase, generalDetails.tags, productUploadId);

                return new Response(
                    JSON.stringify({
                        success: true,
                        message: "General Details Uploaded Successfully",
                        product_id: productUploadId,
                    }),
                    {
                        status: 200, 
                        headers: corsHeaders
                    }
                );
                break;


            case 'ProductVariantData':
                const mainProductIdRaw = formData.get('generalDetailsProductId');
                const brandCurrency = formData.get('currency');
                if (!mainProductIdRaw || typeof mainProductIdRaw !== 'string' || !brandCurrency || typeof brandCurrency !== 'string') {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: "Missing or invalid Main Product ID"
                            }),
                        { 
                            status: 400, 
                            headers: corsHeaders 
                        }
                    );
                }
                const mainProductId = mainProductIdRaw as string;
                const tempVariants: { [key: number]: Partial<ParsedEdgeVariant> } = {};
                const variantImagesMap: Record<number, File[]> = {};


                // Collect all variant fields
                for (const [key, value] of formData.entries()) {
                    if (key.startsWith('variants[')) {
                        const match = key.match(/variants\[(\d+)\]\[([^\]]+)\]/);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            const field = match[2];

                            if (!tempVariants[index]) {
                                tempVariants[index] = {};
                            }

                            if (field === 'images') {
                                if (value instanceof File) {
                                    if (!variantImagesMap[index]) {
                                        variantImagesMap[index] = [];
                                    }
                                    variantImagesMap[index].push(value);
                                } else if (typeof value === 'string') {
                                    // This is an existing image URL. For a "create" operation,
                                    // these might be ignored if `createImages` only handles new File uploads.
                                    // If you need to store these, add them to tempVariants[index].
                                    console.log(`Received string image URL: ${value} for variant ${index}. This may be ignored by createImages if it expects File objects.`);
                                    // Example:
                                    // if (!tempVariants[index].existingImageUrls) { (tempVariants[index] as any).existingImageUrls = []; }
                                    // (tempVariants[index] as any).existingImageUrls.push(value);
                                }
                            } else if(typeof value === 'string') {
                                if (field === 'measurements' || field === 'colorHexes') {
                                    try {
                                        (tempVariants[index] as any)[field] = JSON.parse(value);
                                    } catch (error) {
                                        console.error(`Failed to parse JSON for field ${field} at index ${index}:`, error);
                                        return new Response(JSON.stringify({ 
                                            success: false, 
                                            message: `Invalid JSON for ${field} for variant ${index + 1}` 
                                        }), { 
                                            status: 400, 
                                            headers: corsHeaders 
                                        });
                                    }
                                } else {
                                    (tempVariants[index] as any)[field] = value;
                                }
                            }
                        }
                    }
                }

                console.log(`The tempVariants are ${JSON.stringify(tempVariants)}`);
                console.log(`The brand currency is ${brandCurrency}`);
                const baseCurrencyRate = await GetExchangeRates(supabase, "USD", brandCurrency);

                const processedVariants: ParsedEdgeVariant[] = Object.keys(tempVariants)
                    .map(key => Number(key))
                    .sort((a, b) => a - b)
                    .map(index => {
                        // Perform validation or ensure all required fields are present
                        // For example, you might want to use a Zod schema here
                        return tempVariants[index] as ParsedEdgeVariant;
                    });

                if (processedVariants.length === 0) {
                    return new Response(
                        JSON.stringify({ success: false, message: "No variant data received or variants are empty." }),
                        { status: 400, headers: corsHeaders }
                    );
                };

                const uploadedVariantIds = [];
                for (let i = 0; i < processedVariants.length; i++) {
                    const variant = processedVariants[i];
                    const imagesToUpload = variantImagesMap[i] || [];

                    // Add more robust validation for each variant object here if needed

                    const priceNum = parseFloat(variant.price.replace(/,/g, '')!);
                    if (isNaN(priceNum)) {
                        return new Response(JSON.stringify({ success: false, message: `Invalid price for variant ${variant.variantName}` }), { status: 400, headers: corsHeaders });
                    }
                    
                    // calculate base currency price
                    const baseCurrencyPrice = priceNum / baseCurrencyRate; 

                    const colorId = await createColor(supabase, variant.colorName!, variant.mainColor!);

                    const variantId = await createVariant(
                        supabase,
                        variant.variantName!,
                        variant.sku!,
                        priceNum,
                        baseCurrencyPrice,
                        colorId,
                        variant.colorDescription!,
                        variant.productCode!,
                        variant.availableDate!,
                        variant.imagesDescription!,
                        mainProductId,
                    );
                    if (variant.measurementUnit && variant.measurements && Object.keys(variant.measurements).length > 0) {
                        await createSizes(supabase, variantId, { measurements: variant.measurements }, variant.measurementUnit);
                    }
                    for (const [imgIndex, imageFile] of imagesToUpload.entries()) {
                        await createImages(supabase, variantId, imageFile, imgIndex);
                    }
                    uploadedVariantIds.push(variantId);
                } 
                return new Response(
                    JSON.stringify({
                        success: true,
                        message: "Product Variants Uploaded Successfully",
                        variant_ids: uploadedVariantIds,
                        main_product_id: mainProductId
                    }),
                    { status: 200, headers: corsHeaders }
                );
                break;

            case 'ProductShippingData':
                const productShippingConfigRaw = formData.get('productShippingConfig');

                if (!productShippingConfigRaw || typeof productShippingConfigRaw !== 'string') {
                    return new Response(JSON.stringify({ success: false, message: "Missing or invalid productShippingConfig" }), { status: 400, headers: corsHeaders });
                }
                let productShippingConfig; 
                try {
                    productShippingConfig = JSON.parse(productShippingConfigRaw);
                } catch (e) {
                    console.error("Error parsing productShippingConfig JSON:", e);
                    return new Response(JSON.stringify({ success: false, message: "Invalid JSON in productShippingConfig" }), { status: 400, headers: corsHeaders });
                }              
                
                // Get the productId from the parsed config object itself.
                const productId = productShippingConfig.productId;

                if (!productId || typeof productId !== 'string') {
                    return new Response(JSON.stringify({ success: false, message: "Missing or invalid productId within the shipping configuration data." }), { status: 400, headers: corsHeaders });
                }

                // Call the action to create/update shipping details and method fees
                const productShippingDetailsId = await createProductShippingDetails(supabase, productShippingConfig); 
                return new Response(
                    JSON.stringify({
                        success: true,
                        message: "Product Shipping Details Uploaded Successfully",
                        product_shipping_details_id: productShippingDetailsId,
                    }),
                    { status: 200, headers: corsHeaders }
                );
                break;

            default:
                break;
        }

        
        // Process general details
        // const generalDetailsRaw = formData.get('generalDetails');
        // if (!generalDetailsRaw || typeof generalDetailsRaw !== 'string') {
        //     return new Response(
        //         JSON.stringify({ success: false, message: "Missing or invalid generalDetails" }),
        //         { status: 400, headers: corsHeaders }
        //     );
        // }

        // let generalDetails: GeneralDetails;
        // try {
        //     generalDetails = JSON.parse(generalDetailsRaw);
        // } catch (e: any) {
        //     return new Response(
        //         JSON.stringify({ success: false, message: e.message || "Invalid JSON in generalDetails" }),
        //         { status: 400, headers: corsHeaders }
        //     );
        // }

        // Process variants
        // const variants: ProductVariantType[] = [];
        // const variantImagesMap: Record<number, File[]> = {};

        // // First pass: collect all variant fields
        // for (const [key, value] of formData.entries()) {
        //     if (key.startsWith('variants[')) {
        //         const match = key.match(/variants\[(\d+)\]\[([^\]]+)\]/);
        //         if (match) {
        //             const index = parseInt(match[1]);
        //             const field = match[2];

        //             if (!variants[index]) {
        //                 variants[index] = {
        //                     variantName: '',
        //                     sku: '',
        //                     price: '0',
        //                     colorName: '',
        //                     productCode: '',
        //                     colorDescription: '',
        //                     mainColor: '',
        //                     measurementUnit: '',
        //                     measurements: {}
        //                 };
        //             }

        //             if (field === 'images' && value instanceof File) {
        //                 if (!variantImagesMap[index]) {
        //                     variantImagesMap[index] = [];
        //                 }
        //                 variantImagesMap[index].push(value);
        //             } else if (typeof value === 'string') {
        //                 // Handle measurements separately
        //                 if (field === 'measurements') {
        //                     try {
        //                         variants[index].measurements = JSON.parse(value);
        //                     } catch (e) {
        //                         console.error("Failed to parse measurements:", e);
        //                     }
        //                 } else {
        //                     // Assign other fields
        //                     (variants[index] as any)[field] = value;
        //                 }
        //             }
        //         }
        //     }
        // }

        // // Validate we have at least one variant
        // if (variants.length === 0) {
        //     return new Response(
        //         JSON.stringify({ success: false, message: "At least one product variant is required" }),
        //         { status: 400, headers: corsHeaders }
        //     );
        // }

        // Authenticate user
        // const { data: { user }, error: userError } = await supabase.auth.getUser();
        // if (userError || !user) {
        //     return new Response(
        //         JSON.stringify({ success: false, message: "User not authenticated" }),
        //         { status: 401, headers: corsHeaders }
        //     );
        // }

        // // Sanitize and validate inputs
        // const name = validator.trim(generalDetails.productName);
        // if (!name) {
        //     return new Response(
        //         JSON.stringify({ success: false, message: "Product name is required" }),
        //         { status: 400, headers: corsHeaders }
        //     );
        // }

        // const category = validator.trim(generalDetails.category);
        // const subCategory = validator.trim(generalDetails.subCategory);
        // const tags = generalDetails.tags.map((tag: string) => validator.trim(tag.toLowerCase()));
        // const description = validator.trim(generalDetails.productDescription);
        // const material = validator.trim(generalDetails.material);
        // const currency = validator.trim(generalDetails.currency);

        // Insert general details into database
        // const categoryId = await createCategory(supabase, category);
        // const subCategoryId = await createSubCategory(supabase, subCategory, categoryId);
        // const materialId = await createMaterial(supabase, material);
        // const currencyId = await createCurrency(supabase, currency);
        // const productUploadId = await createProduct(
        //     supabase, 
        //     categoryId, 
        //     subCategoryId, 
        //     materialId, 
        //     description, 
        //     name, 
        //     currencyId, 
        //     user.id
        // );

        //await createTags(supabase, tags, productUploadId);

        // Get exchange rate for pricing
        //const baseCurrencyRate = await GetExchangeRates(supabase, "USD", currency);

        // Process each variant
        // const variantUploadPromises = variants.map(async (variant, index) => {
        //     // Validate required variant fields
        //     if (!variant.variantName || !variant.sku || !variant.price) {
        //         throw new Error(`Variant ${index} is missing required fields`);
        //     }

        //     const price = parseFloat(variant.price.replace(/,/g, ''));
        //     if (isNaN(price)) {
        //         throw new Error(`Invalid price format for variant ${index}`);
        //     }

        //     const baseCurrencyPrice = price / baseCurrencyRate;
            
        //     // Process color
        //     if (!variant.colorName || !variant.mainColor) {
        //         throw new Error(`Variant ${index} is missing color information`);
        //     }

        //     const colorId = await createColor(supabase, variant.colorName, variant.mainColor);
            
        //     // Create variant
        //     const variantId = await createVariant(
        //         supabase, 
        //         variant.variantName, 
        //         variant.sku, 
        //         price, 
        //         baseCurrencyPrice, 
        //         colorId, 
        //         variant.colorDescription, 
        //         variant.productCode, 
        //         productUploadId
        //     );

        //      // Process measurements - handle empty measurements case
		// 	if (variant.measurementUnit && variant.measurements && Object.keys(variant.measurements).length > 0) {
		// 		try {
		// 			await createSizes(
		// 				supabase, 
		// 				variantId, 
		// 				{ measurements: variant.measurements }, 
		// 				variant.measurementUnit
		// 			);
		// 		} catch (error) {
		// 			console.error(`Error inserting sizes for variant ${index}:`, error);
		// 			throw new Error(`Failed to save measurements for variant ${index}`);
		// 		}
		// 	} else {
		// 		console.log(`No measurements provided for variant ${index}`);
		// 	}

        //     // Process images
        //     const images = variantImagesMap[index] || [];
        //     await Promise.all(
        //         images.map((imageFile, imgIndex) =>
        //             createImages(supabase, variantId, imageFile, imgIndex)
        //         )
        //     );

        //     return variantId;
        // });

        //const uploadedVariantIds = await Promise.all(variantUploadPromises);
        
        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Product uploaded successfully", 
                // product_id: productUploadId,
                // variant_ids: uploadedVariantIds,
                product_id: "",
                variant_ids: "",
            }), 
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        console.error("Error in Upload Function: ", error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: error.message || "An error occurred while uploading the product" 
            }), 
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});