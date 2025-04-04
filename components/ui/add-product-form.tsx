"use client";

import { useEffect, useState } from "react";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";
import ProductPreviewModal from "../modals/product-preview-modal";
import ProductPreview from "../upload-product/product-preview";
import { ProductUploadData, ProductVariantType } from "../../lib/types";
import { useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/supabase/client";

const AddProductForm = () => {

    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [isGeneralDetailsSaved, setIsGeneralDetailsSaved] = useState<boolean>(false);
    const [variantSavedStatus, setVariantSavedStatus] = useState<boolean[]>([]);

    const router = useRouter();
	const [productData, setProductData] = useState<ProductUploadData>({
		generalDetails: {
			productName: "",
			productDescription: "",
			category: "",
			subCategory: "",
			tags: [],
			currency: "",
			material: "",
		},
		productVariants: [],
        shippingDelivery: {
            shippingMethods: [],
            shippingZones: [],
            estimatedDelivery: {},
            shippingFees: {},
            handlingTime: "1-3 days",
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            customsDuties: "buyer-paid",
            cashOnDelivery: true
        },
        returnRefundPolicy: {
            returnWindow: 0,
            refundMethod: "replacement",
            returnShipping: "free_returns",
            conditions: "",
        }
	});

    const isAllVariantsSaved = () => {
        return variantSavedStatus.length > 0 && 
               variantSavedStatus.every(status => status);
    };

    const isVariantSaved = (index: number) => {
        return productData.productVariants[index] ? true : false;
    };

    const handleVariantSaved = (index: number, isSaved: boolean) => {
        setVariantSavedStatus(prev => {
            // Ensure the array is long enough
            const newStatus = [...prev];
            while (newStatus.length <= index) {
                newStatus.push(false);
            }
            newStatus[index] = isSaved;
            return newStatus;
        });
    };

    useEffect(() => {
        // Enable Publish button only if both accordions are saved and there are no unsaved changes
        setIsFormValid(isGeneralDetailsSaved && isAllVariantsSaved());
        console.log("The isGeneralDetailsSaved is ", isGeneralDetailsSaved);
        console.log("The isAllVariantsSaved is ", isAllVariantsSaved());
    }, [isGeneralDetailsSaved, variantSavedStatus]);
	  
	const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);

    const handlePubClick = async () => {
        console.log("The Product general details are ", productData.generalDetails);
        console.log("The product variants data are ", productData.productVariants);
    }
	const handlePublishClick = async () => {
        if (!isFormValid) {
            console.log("Form is not valid");
            return;
        }
	    //setPreviewModalOpen(true);
        const formData = new FormData();

        //const measurementsJson = JSON.stringify(productData.productInformation.measurements);

        // Add General Details Begin
        formData.append("productName", productData.generalDetails.productName);
        formData.append("productDescription", productData.generalDetails.productDescription);
        formData.append("category", productData.generalDetails.category);
        formData.append("subCategory", productData.generalDetails.subCategory);
        formData.append("tags", productData.generalDetails.tags.join(","));
        formData.append("material", productData.generalDetails.material);
        formData.append("currency", productData.generalDetails.currency);
        // Add General Details End

        // Add Main Variant Details Begin
        // formData.append("variantName", productData.productInformation.variantName);
        // formData.append("variantSku", productData.productInformation.sku);
        // formData.append("variantPrice", productData.productInformation.price);
        // formData.append("variantColorName", productData.productInformation.colorName);
        // formData.append("variantColorHex", productData.productInformation.colorHex);
        // formData.append("variantProductCode", productData.productInformation.productCode);
        // formData.append("variantMeasurements", measurementsJson); 
        // // Add images
        // const validImages = productData.productInformation.images.filter(image => image !== null);

        const convertBlobUrlToFile = async (blobUrl: string, index: number) => {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const file = new File([blob], `image-${index}.png`, { type: blob.type });
            return file;
        };

        // const imageFiles = await Promise.all(
        //     validImages.map((blobUrl, index) => convertBlobUrlToFile(blobUrl, index))
        // );
        
        // imageFiles.forEach((image) => {
        //     formData.append("images", image);
        // });
        // Add Main Variant Details End

        //Add other variants if available Begin
        formData.append("variants", JSON.stringify(productData.productVariants));
        //Add other variants if available End

        try {
            const { data: { session }, error } = await createClient().auth.getSession();

            
            if (error) {
                throw new Error("Failed to get session.");
            }
    
            if (!session) {
                throw new Error("User is not authenticated.");
            }

            console.log("Access Token:", session.access_token);

            const accessToken = session.access_token;
            
            const res =  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`, 
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        //"Content-Type": "multipart/form-data"
                    },
                    body: formData,
                });
          
            if (!res.ok) {
                throw new Error("Failed to upload product. Response error.");
            }
        
            const data = await res.json();
            if (data.success) {
                console.log("Data uploaded successfully: ", data);
                //router.push(`/dashboard/product-details/${data.productId}`);
            } else {
                console.error(`Product upload failed: ${data.message}`);
                throw new Error(`Data not uploaded: ${data.message}`);
            }
            
        } catch (error) {
            //create and pass error to modal for further actions
            console.error("Error publishing product: ", error);
        }
	};

    const handleVariantClick = (variant: ProductVariantType) => {
		setSelectedVariant(variant);
	};

	const closeModal = () => {
		setPreviewModalOpen(false); 
	};

    return (
        <div className="container overflow-auto mx-auto p-4 mt-4">
            <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-3/4">
                    <AddProductDetails 
                        productData={productData} 
                        setProductData={setProductData}
                        setIsGeneralDetailsSaved={setIsGeneralDetailsSaved}
                        onVariantSaved={handleVariantSaved}
                        savedStatus={variantSavedStatus}
                    />
                </div>
                <div className="w-full md:w-1/4 mt-12">
                    <PublishProduct onPublishClick={handlePubClick} isFormValid={isFormValid} isAllVariantsSaved={isAllVariantsSaved()}
                    />
                </div>

				{isPreviewModalOpen && (
                    <>
                        {/* <div className="">
                            <ModalBackdrop />
                            <ProductPreviewModal onClose={closeModal}>
                                <ProductPreview
                                    productData={productData}
                                    selectedVariant={selectedVariant}
                                    onVariantClick={handleVariantClick}
                                />
                            </ProductPreviewModal>
                        </div> */}
                    </>
			    )}
            </div>
        </div>
    );
};

export default AddProductForm;
