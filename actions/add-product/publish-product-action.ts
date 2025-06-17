import { GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "@/lib/types";

export interface PublishProductResponse {
    success: boolean;
    message: string;
    data: any;
}


export const uploadGeneralDetails = async (
    generalData: GeneralProductDetailsType,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('generalDetails', JSON.stringify(generalData));

        return {
            success: true,
            message: "General Details Uploaded Successfully",
            data: `${generalData}`
        }
    } catch (error) {
        return {
            success: false, 
            message: "Uh oh! Something went wrong.",
            data: `${error}`
        }
    }
}

export const uploadProductVariants = async (
    productVariants: ProductVariantType[],
    generalDetailsProductId: string,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('generalDetailsProductId', generalDetailsProductId);
        for (const [variantIndex, variant] of productVariants.entries()) {
            formData.append(`variants[${variantIndex}][variantName]`, variant.variantName);
            formData.append(`variants[${variantIndex}][sku]`, variant.sku);
            formData.append(`variants[${variantIndex}][price]`, variant.price.toString()); // Ensure price is a string
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

        return {
            success: true,
            message: "Product Variants Uploaded Successfully",
            data: `${productVariants}`
        }
    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`
        }
    }
}

export const uploadProductShippingDetails = async (
    productShippingConfig: ProductShippingDeliveryType,
    productId: string,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('productShippingConfig', JSON.stringify(productShippingConfig));
        console.log(`productShippingConfig: ${JSON.stringify(productShippingConfig)}`);
        return {
            success: true,
            message: "Product Shipping Details Uploaded Successfully",
            data: `${productShippingConfig}`
        }
    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`
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
            data: `${productCareInstruction}`
        }
    } catch (error) {
        return {
            success: false,
            message: "Uh oh! Something went wrong.",
            data: `${error}`
        }
    }
}