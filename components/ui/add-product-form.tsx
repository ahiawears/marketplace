"use client";

import { useEffect, useState } from "react";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";
import ProductPreviewModal from "../modals/product-preview-modal";
import ProductPreview from "../upload-product/product-preview";
import { ProductUploadData, ProductVariantType } from "../../lib/types";
import { redirect, useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/supabase/client";
import LoadContent from "@/app/load-content/page";
import { useAuth } from "@/hooks/useAuth";

const AddProductForm = () => {
    const { userId, userSession, loading, error, resetError } = useAuth();
    const [accessToken, setAccessToken] = useState<string>("");
    
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [isGeneralDetailsSaved, setIsGeneralDetailsSaved] = useState<boolean>(false);
    const [variantSavedStatus, setVariantSavedStatus] = useState<boolean[]>([]);
    const [formError, setFormError] = useState<string | null>("");
    

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
	  
	const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);

    const handlePubClick = async () => {
        
        console.log("The Product is ", productData);
        try {
            const formData = new FormData();

            // Append general details
            formData.append('generalDetails', JSON.stringify(productData.generalDetails));

            // Append variants
            for (const variant of productData.productVariants) {
                const variantIndex = productData.productVariants.indexOf(variant);
                
                // Append variant data
                formData.append(`variants[${variantIndex}][variantName]`, variant.variantName);
                formData.append(`variants[${variantIndex}][sku]`, variant.sku);
                formData.append(`variants[${variantIndex}][price]`, variant.price.toFixed(2)); // Ensure price is a number
                formData.append(`variants[${variantIndex}][colorName]`, variant.colorName);
                formData.append(`variants[${variantIndex}][mainColor]`, variant.mainColor);
                formData.append(`variants[${variantIndex}][productCode]`, variant.productCode);
                formData.append(`variants[${variantIndex}][measurementUnit]`, variant.measurementUnit);
                formData.append(`variants[${variantIndex}][measurements]`, JSON.stringify(variant.measurements));
                formData.append(`variants[${variantIndex}][colorDescription]`, variant.colorDescription);

                // Append image blobs
                for (const [index, blobUrl] of variant.images.filter(img => img.startsWith('blob:')).entries()) {
                    const response = await fetch(blobUrl);
                    const blob = await response.blob();
                    const filename = `variant_${variantIndex}_image_${index + 1}.jpg`; // Generate a filename
                    formData.append(`variants[${variantIndex}][images]`, blob, filename);
                }
                // Append non-blob images
                for (const [index, imageUrl] of variant.images.filter(img => !img.startsWith('blob:')).entries()) {
                    formData.append(`variants[${variantIndex}][images]`, imageUrl);
                }
            }

            console.log(`The formData is `, formData.get('generalDetails') as string);

            const res =  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`, 
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        //"Content-Type": "application/json"
                    },
                    body: formData,
                });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server Error Details:", errorData);
                throw new Error(`Failed to upload product. Response error: ${res.status} - ${res.statusText}`);
            }

            const data = await res.json();

            if (data.success) {
                console.log("Product uploaded successfully:", data);
                //router.push(`/dashboard/products`);
            } else {
                throw new Error(data.message || "Product upload failed");
            }

        } catch (error) {
            console.error("Error publishing product:", error);console.log(error)
        } 
    }
    
    const handleVariantClick = (variant: ProductVariantType) => {
		setSelectedVariant(variant);
	};

	const closeModal = () => {
		setPreviewModalOpen(false); 
	};
    useEffect(() => {
        if (userId && userSession) {
            setAccessToken(userSession.access_token);
        } else {
            console.log("No user id or session found");
        }
    }, [userId, userSession]);

    useEffect(() => {
        // Enable Publish button only if both accordions are saved and there are no unsaved changes
        setIsFormValid(isGeneralDetailsSaved && isAllVariantsSaved());
        console.log("The isGeneralDetailsSaved is ", isGeneralDetailsSaved);
        console.log("The isAllVariantsSaved is ", isAllVariantsSaved());
    }, [isGeneralDetailsSaved, variantSavedStatus]);

    if (loading) {
        return <LoadContent />
    }
    
    if (!userId) {
        redirect("/login-brand");
        return null;
    }

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
                        userId={userId}
                        accessToken={accessToken}
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
