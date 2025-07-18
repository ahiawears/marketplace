import { GeneralProductDetailsType, ProductCareInstruction, ProductReleaseDetails, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "@/lib/types";

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
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
            data: null,
            loading: false
        }
    } 
}


export const uploadProductVariant = async ( // Renamed function for clarity
  productVariant: ProductVariantType, // Expecting a single ProductVariantType
  generalDetailsProductId: string,
  currency: string,
  accessToken: string
): Promise<PublishProductResponse> => {
  try {
    const formData = new FormData();
    formData.append("generalDetailsProductId", generalDetailsProductId);
    formData.append("operation", "ProductSingleVariantData");
    formData.append("currency", currency);

    // Directly append properties of the single productVariant
    formData.append("variantName", productVariant.variantName);
    formData.append("sku", productVariant.sku);
    formData.append("price", productVariant.price.toString());
    formData.append("colorName", productVariant.colorName);
    formData.append("mainColor", productVariant.mainColor);
    formData.append("productCode", productVariant.productCode);
    formData.append("measurementUnit", productVariant.measurementUnit);
    formData.append(
      "measurements",
      JSON.stringify(productVariant.measurements)
    );
    formData.append("colorDescription", productVariant.colorDescription || "");
    formData.append(
      "imagesDescription",
      productVariant.imagesDescription || ""
    );
    formData.append("availableDate", productVariant.availableDate || "");
    formData.append(
      "colorHexes",
      JSON.stringify(productVariant.colorHexes || [])
    );

    // Handle images for the single variant
    for (const [index, blobUrl] of productVariant.images
      .filter((img) => img && img.startsWith("blob:"))
      .entries()) {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const filename = `variant_image_${index + 1}.jpg`; // Simplified filename
      formData.append("images", blob, filename); // Append to 'images' directly
    }
    for (const imageUrl of productVariant.images.filter(
      (img) => img && !img.startsWith("blob:")
    )) {
      formData.append("images", imageUrl); // Append to 'images' directly
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server Error Details:", errorData);
      throw new Error(
        `Failed to upload product variant details. Response error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.success) {
      console.log("Product variant uploaded successfully:", data);
      return {
        success: true,
        message: "Product Variant Details Uploaded Successfully",
        data: `${data.product_id}`,
        loading: false,
      };
    } else {
      throw new Error(data.message || "Product Variant Details upload failed");
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred.",
      data: null,
      loading: false,
    };
  }
};

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
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
            data: null,
            loading: false

        }
    }
}

export const uploadProductCareInstruction = async (
    productCareInstruction: ProductCareInstruction,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('productCareInstruction', JSON.stringify(productCareInstruction));
        formData.append('operation', 'ProductCareInstruction');

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData
            }
        )

        console.log(formData.get('productCareInstruction'));

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error Details:", errorData);
            throw new Error(`Failed to upload products care instruction details. Response error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

         if (data.success) {
            console.log("Product Care Instruction uploaded successfully:", data);
            return {
                success: true,
                message: "Product Care Instruction Uploaded Successfully",
                data: `${productCareInstruction}`,
                loading: false
            }
        } else {
            throw new Error(data.message || "Product Care Instruction Details upload failed");
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
            data: null,
            loading: false

        }
    }
}

export const publishProduct = async (
    productId: string,
    releaseDetails: ProductReleaseDetails,
    accessToken: string,
) : Promise<PublishProductResponse> => {
    try {
        const formData = new FormData();
        formData.append('operation', 'ProductReleaseDetails');
        formData.append('productId', productId);
        formData.append('releaseDetails', JSON.stringify(releaseDetails));

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error Details:", errorData);
            throw new Error(`Failed to publish product. Response error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                message: "Product release details saved successfully!",
                data: data,
                loading: false
            };
        } else {
            throw new Error(data.message || "Failed to save product release details.");
        }

    } catch (error) {
        console.error("Error in publishProduct action:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
            data: null,
            loading: false
        }
    }
}