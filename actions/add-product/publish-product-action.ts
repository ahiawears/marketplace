import { GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "@/lib/types";

export interface PublishProductResponse {
    success: boolean;
    message: string;
    loading: boolean;
    data: any;
}

export const uploadGeneralDetails = async (
    generalData: GeneralProductDetailsType,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        console.log(`The product general data is ${generalData}`)
        const formData = new FormData();
        formData.append('generalDetails', JSON.stringify(generalData));
        formData.append('operation', 'ProductGeneralData');

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            }
        )

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error Details:", errorData);
            throw new Error(`Failed to upload products general details. Response error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

         if (data.success) {
            console.log("Product uploaded successfully:", data);
            return {
                success: true,
                message: "General Details Uploaded Successfully",
                data: `${data.product_id}`,
                loading: false
            }
        } else {
            throw new Error(data.message || "Product General Details upload failed");
        }
    } catch (error) {
        return {
            success: false, 
            message: "Uh oh! Something went wrong.",
            data: `${error}`,
            loading: false
        }
    } 
}

export const uploadProductVariants = async (
    productVariants: ProductVariantType[],
    generalDetailsProductId: string,
    currency: string,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('generalDetailsProductId', generalDetailsProductId);
        formData.append('operation', 'ProductVariantData');
        formData.append('currency', currency);

        for (const [variantIndex, variant] of productVariants.entries()) {
            formData.append(`variants[${variantIndex}][variantName]`, variant.variantName);
            formData.append(`variants[${variantIndex}][sku]`, variant.sku);
            formData.append(`variants[${variantIndex}][price]`, variant.price.toString());
            formData.append(`variants[${variantIndex}][colorName]`, variant.colorName);
            formData.append(`variants[${variantIndex}][mainColor]`, variant.mainColor);
            formData.append(`variants[${variantIndex}][productCode]`, variant.productCode);
            formData.append(`variants[${variantIndex}][measurementUnit]`, variant.measurementUnit);
            formData.append(`variants[${variantIndex}][measurements]`, JSON.stringify(variant.measurements));
            formData.append(`variants[${variantIndex}][colorDescription]`, variant.colorDescription || "");
            formData.append(`variants[${variantIndex}][imagesDescription]`, variant.imagesDescription || "");
            formData.append(`variants[${variantIndex}][availableDate]`, variant.availableDate || "");
            formData.append(`variants[${variantIndex}][colorHexes]`, JSON.stringify(variant.colorHexes || []));

            for (const [index, blobUrl] of variant.images.filter(img => img && img.startsWith('blob:')).entries()) {
                const response = await fetch(blobUrl);
                const blob = await response.blob();
                const filename = `variant_${variantIndex}_image_${index + 1}.jpg`;
                formData.append(`variants[${variantIndex}][images]`, blob, filename);
            }
            for (const imageUrl of variant.images.filter(img => img && !img.startsWith('blob:'))) {
                formData.append(`variants[${variantIndex}][images]`, imageUrl);
            }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`, 
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            }
        )

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error Details:", errorData);
            throw new Error(`Failed to upload products variant details. Response error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log("Product uploaded successfully:", data);
            return {
                success: true,
                message: "Product Variants Details Uploaded Successfully",
                data: `${data.product_id}`,
                loading: false
            }
        } else {
            throw new Error(data.message || "Product Variants Details upload failed");
        }
    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`,
            loading: false
        }
    }
}

export const uploadProductShippingDetails = async (
    productShippingConfig: ProductShippingDeliveryType,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('operation', 'ProductShippingData');
        formData.append('productShippingConfig', JSON.stringify(productShippingConfig));

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData
            }
        )

        console.log(formData.get('productShippingConfig'));

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error Details:", errorData);
            throw new Error(`Failed to upload products shipping details. Response error: ${response.status} - ${response.statusText}`);
        }

         const data = await response.json();

         if (data.success) {
            console.log("Product shipping details uploaded successfully:", data);
            return {
                success: true,
                message: "Product Shipping Details Uploaded Successfully",
                data: `${productShippingConfig}`,
                loading: false
            }
        } else {
            throw new Error(data.message || "Product Shipping Details upload failed");
        }

    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`,
            loading: false

        }
    }
}

export const uploadProductCareInstruction = async (
    productCareInstruction: ProductCareInstruction,
    productId: string,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('productCareInstruction', JSON.stringify(productCareInstruction));
        console.log(`productCareInstruction: ${JSON.stringify(productCareInstruction)}`);
        return {
            success: true,
            message: "Product Care Instruction Uploaded Successfully",
            data: `${productCareInstruction}`, 
            loading: false

        }
    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`,
            loading: false

        }
    }
}