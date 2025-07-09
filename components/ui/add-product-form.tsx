"use client";

import { useEffect, useState } from "react";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";
import ProductPreviewModal from "../modals/product-preview-modal";
import ProductPreview from "../upload-product/product-preview";
import { ProductReleaseDetails, ProductUploadData, ProductVariantType } from "../../lib/types";
import { redirect, useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/supabase/client";
import LoadContent from "@/app/load-content/page";
import { useAuth } from "@/hooks/useAuth";
import ReviewAndPublishModal from "../modals/review-publish-product-modal";
import { publishProduct } from "@/actions/add-product/publish-product-action";

const AddProductForm = () => {
    const { userId, userSession, loading, error, resetError } = useAuth();
    const [ accessToken, setAccessToken ] = useState<string>("");

    const [ productId, setProductId ] = useState<string>("");
    const [ isPublishModalOpen, setIsPublishModalOpen ] = useState(false);

    const [ isAllDetailsSaved, setIsAllDetailsSaved ] = useState<boolean>(false);
    const [ variantSavedStatus, setVariantSavedStatus ] = useState<boolean[]>([]);    

	const [productData, setProductData] = useState<ProductUploadData>({
		generalDetails: {
			productName: "",
			productDescription: "",
			category: "",
			subCategory: "",
			tags: [],
			currency: "",
			material: "",
            gender: "",
            season: "",
		},
		productVariants: [],
        shippingDelivery: {
            productId: "",
            methods: {
                sameDay: {
                    available: false,
                    fee: 0,
                },
                standard: {},
                express: {}
            },
            weight: 0,
            dimensions: {
                length: 0,
                width: 0,
                height: 0
            },

        },
        returnRefundPolicy: {
            returnWindow: 0,
            refundMethod: "replacement",
            returnShipping: "free_returns",
            conditions: "",
        },
        careInstructions: {
            productId: "",
            washingInstruction: "",
            bleachingInstruction: "",
            dryingInstruction: "",
            ironingInstruction: "",
            dryCleaningInstruction: "",
            specialCases: ""
        },
        release: {
            isPublished: false,
            releaseDate: "",
            timeZone: "",
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

    const handleVariantClick = (variant: ProductVariantType) => {
		setSelectedVariant(variant);
	};

	const closeModal = () => {
		setPreviewModalOpen(false); 
	};

    const handleOpenPublishModal = () => setIsPublishModalOpen(true);
    const handleClosePublishModal = () => setIsPublishModalOpen(false);

    const handlePreviewFromPublishModal = () => {
        // This will close the publish modal and open the preview modal
        setIsPublishModalOpen(false);
        setPreviewModalOpen(true);
    };

    const handlePublish = async (releaseDetails: ProductReleaseDetails) => {
        if (!productId) {
            alert("Cannot publish. Product has not been saved yet. Please complete all steps.");
            return;
        }

        console.log("Publishing with details:", releaseDetails);

        const result = await publishProduct(productId, releaseDetails, accessToken);

        if (result.success) {
            setProductData(prev => ({
                ...prev,
                release: releaseDetails,
            }));
            setIsPublishModalOpen(false);
            alert(`Product schedule has been updated! It will be ${releaseDetails.isPublished ? 'published now' : `scheduled for release.`}`);
        } else {
            alert(`Failed to publish: ${result.message}`);

        }
    };

    useEffect(() => {
        if (userId && userSession) {
            setAccessToken(userSession.access_token);
        } else {
            console.log("No user id or session found");
        }
    }, [userId, userSession]);


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
                        onVariantSaved={handleVariantSaved}
                        savedStatus={variantSavedStatus}
                        userId={userId}
                        accessToken={accessToken}
                        setMainProductId={setProductId}
                        setIsAllDetailsSaved={setIsAllDetailsSaved}

                    />
                </div>
                <div className="w-full md:w-1/4 mt-12">
                    <PublishProduct 
                        isAllDetailsSaved={isAllDetailsSaved} 
                        isAllVariantsSaved={isAllVariantsSaved()}
                        productData={productData}
                        onPublishClick={handleOpenPublishModal}
                    />
                </div>

				{isPublishModalOpen && (
                    <ReviewAndPublishModal
                        productData={productData}
                        onClose={handleClosePublishModal}
                        onPreview={handlePreviewFromPublishModal}
                        onPublish={handlePublish}
                    />
                )}
            </div>
        </div>
    );
};

export default AddProductForm;
