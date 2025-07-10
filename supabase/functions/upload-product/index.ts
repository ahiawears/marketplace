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
import { createProductCareInstruction } from "@actions/create-care-instruction.ts";
import { createProductShippingDetails } from "@actions/create-shipping-details.ts";
import validator from "npm:validator";
import { createClient } from "../../server-deno.ts";  
import { corsHeaders } from '../_shared/cors.ts';
import { validateGeneralProductDetails, GeneralDetails as ValidationGeneralDetails, GeneralDetailsErrors } from "../_shared/product-data-validation.ts"; // Import validation
import { GetExchangeRates } from '@hooks/get-exchange-rate.ts';
import { ProductReleaseDetails } from "@lib/types.ts";
import { DateTime } from "npm:luxon";

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
                if (!mainProductIdRaw || typeof mainProductIdRaw !== 'string') {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: "Missing or invalid Main Product ID"
                        }), { 
                            status: 400, 
                            headers: corsHeaders 
                        }
                    );
                }

                if (!brandCurrency || typeof brandCurrency !== 'string') {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: "Missing or invalid brand currency"
                        }), { 
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
                    
                    await Promise.all(imagesToUpload.map((imageFile, imgIndex) =>
                        createImages(supabase, variantId, imageFile, imgIndex)
                    ));
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
            case 'ProductCareInstruction':
                const careInstructionsRaw = formData.get('productCareInstruction');
                let productCareInstruction;

                try {
                    productCareInstruction = JSON.parse(careInstructionsRaw as string);
                } catch (error) {
                    console.error("Error parsing productCareInstruction JSON:", error);
                    return new Response(JSON.stringify({ success: false, message: "Invalid JSON in productCareInstruction"}), { status: 400, headers: corsHeaders });
                }

                const main_ProductId = productCareInstruction.productId;

                if ( !main_ProductId || typeof main_ProductId !== 'string') {
                    return new Response(JSON.stringify({ success: false, message: "Missing or invalid productId within the shipping care instruction data." }), { status: 400, headers: corsHeaders });
                }

                //call action to create/update shipping details and method fees
                const productCareInstructionId = await createProductCareInstruction( supabase, productCareInstruction );

                return new Response(
                    JSON.stringify({
                        success: true,
                        message: "Product Care Instruction Uploaded Successfully",
                        product_care_instruction_id: productCareInstructionId,
                    }),
                    { status: 200, headers: corsHeaders}
                );
                break;

            case 'ProductReleaseDetails':
                const releaseProductIdRaw = formData.get('productId') as string;
                const releaseDetailsRaw = formData.get('releaseDetails') as string;

                if (!releaseProductIdRaw || !releaseDetailsRaw) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: "Missing product ID or release details."
                        }),
                        {
                            status: 400,
                            headers: corsHeaders
                        }
                    )
                }

                const releaseDetails: ProductReleaseDetails = JSON.parse(releaseDetailsRaw);

                const updatePayload: {
                    is_published: boolean;
                    release_date?: string | null;
                    release_timezone?: string | null;
                } = {
                    is_published: false,
                };

                if (releaseDetails.isPublished) {
                    // If publishing now, mark as published and set the release date to now.
                    updatePayload.is_published = true;
                    updatePayload.release_date = new Date().toISOString();
                    updatePayload.release_timezone = "UTC";
                } else if (releaseDetails.releaseDate && releaseDetails.timeZone) {
                    // If scheduling, convert the local date/time to a UTC ISO string
                    // A cron job will handle flipping is_published to true later.

                    const dt = DateTime.fromISO(releaseDetails.releaseDate, { zone: releaseDetails.timeZone });
                    if (dt.isValid) {
                        updatePayload.release_date = dt.toUTC().toISO();
                        updatePayload.release_timezone = releaseDetails.timeZone;
                    } else {
                        return new Response(
                            JSON.stringify({ 
                                success: false, 
                                message: `Invalid date/time or time zone: ${dt.invalidReason}` 
                            }), { 
                                status: 400,
                                headers: corsHeaders 
                            }
                        );
                    }
                } else {
                    // This case handles un-publishing or clearing a schedule.
                    // is_published is already false from the default.                    
                    updatePayload.release_date = null;
                    updatePayload.release_timezone = null;
                }

                console.log(`The update payload is ${JSON.stringify(updatePayload)}`);

                const { error: updateError } = await supabase
                    .from('products_list')
                    .update(updatePayload)
                    .eq('id', releaseProductIdRaw);

                if (updateError) {
                    console.error('Error updating product release details:', updateError);
                    return new Response(JSON.stringify({ success: false, message: 'Database error while updating release details.' }), { status: 500, headers: corsHeaders });
                }

                return new Response(
                    JSON.stringify({ 
                        success: true, 
                        message: 'Product release details updated.' 
                    }), { 
                        status: 200, 
                        headers: corsHeaders 
                    });
                break;

            default:
                break;
        }

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