"use client";

import { useEffect, useState } from "react";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";
// Removed unused imports ProductPreviewModal, ProductPreview
import { ProductReleaseDetails, ProductUploadData, ProductVariantType } from "../../lib/types";
import { redirect, useParams, useSearchParams } from "next/navigation";
import React from "react";
import LoadContent from "@/app/load-content/page";
import { useAuth } from "@/hooks/useAuth";
import ReviewAndPublishModal from "../modals/review-publish-product-modal";
import { publishProduct } from "@/actions/add-product/publish-product-action";
import { Toaster } from "sonner";
import { ProductFormProvider } from "@/app/contexts/product-form-context";
import { useGetProductDetails } from "@/hooks/useGetProductDetails"; // Your custom hook

const AddProductForm = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const editProductId = (params.id as string) || (searchParams.get('id') as string);

    const { userId, userSession, loading: authLoading, error: authError } = useAuth();

    // Use productLoading and productError from your hook
    const { loading: productDetailsLoading, error: productDetailsError, productDetails } = useGetProductDetails(editProductId, "getProductForEdit", userSession?.access_token!);

    const [accessToken, setAccessToken] = useState<string>("");
    const [productId, setProductId] = useState<string>(editProductId || "");
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isAllDetailsSaved, setIsAllDetailsSaved] = useState<boolean>(false);
    const [variantSavedStatus, setVariantSavedStatus] = useState<boolean[]>([]);

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
                standard: {}, // This might need more precise initialization based on your form
                express: {}   // This might need more precise initialization based on your form
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
            const newStatus = [...prev];
            while (newStatus.length <= index) {
                newStatus.push(false);
            }
            newStatus[index] = isSaved;
            return newStatus;
        });
    };

    const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);

    const handleVariantClick = (variant: ProductVariantType) => {
        setSelectedVariant(variant);
    };

    const handleOpenPublishModal = () => setIsPublishModalOpen(true);
    const handleClosePublishModal = () => setIsPublishModalOpen(false);

    const handlePreviewFromPublishModal = () => {
        setIsPublishModalOpen(false);
    };

    const handlePublish = async (releaseDetails: ProductReleaseDetails) => {
        if (!productId) {
            alert("Cannot publish. Product has not been saved yet. Please complete all steps.");
            return;
        }

        console.log("Publishing with details:", releaseDetails);

        if (!accessToken) {
            alert("Authentication token missing. Please try again or log in.");
            return;
        }

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

    // Set access token once user session is available
    useEffect(() => {
        if (userId && userSession) {
            setAccessToken(userSession.access_token);
        } else {
            // No user id or session found, could be unauthenticated or still loading
            console.log("No user ID or session found in useAuth.");
        }
    }, [userId, userSession]);

    // Populate form fields when productDetails from the hook becomes available
    useEffect(() => {
        if (editProductId && productDetails && productDetails.success) {
            const fetchedData = productDetails.data;

            // Ensure fetchedData.variants is an array, or default to an empty array
            const variantsToMap = Array.isArray(fetchedData.variants) ? fetchedData.variants : [];

            const transformedProductData: ProductUploadData = {
                generalDetails: {
                    productName: fetchedData.generalDetails?.name || "", // Added optional chaining here too
                    productDescription: fetchedData.generalDetails?.description || "",
                    category: fetchedData.generalDetails?.category || "",
                    subCategory: fetchedData.generalDetails?.subcategory || "",
                    tags: fetchedData.generalDetails?.tags?.map((tag: any) => tag.tag_id.name) || [], // Ensure tags is an array before map
                    currency: "",
                    material: fetchedData.generalDetails?.material || "",
                    gender: fetchedData.generalDetails?.gender || "",
                    season: fetchedData.generalDetails?.season || "",
                },
                productVariants: variantsToMap.map((variant: any) => ({ // Use variantsToMap
                    id: variant.id,
                    name: variant.name,
                    images_description: variant.images_description,
                    price: variant.price,
                    sku: variant.sku,
                    product_code: variant.product_code,
                    color_id: variant.color_id?.id || "",
                    color_name: variant.color_id?.name || "",
                    color_hex_code: variant.color_id?.hex_code || "",
                    base_currency_price: variant.base_currency_price,
                    color_description: variant.color_description,
                    available_date: variant.available_date,
                    images: Array.isArray(variant.images) ? variant.images.map((img: any) => ({
                        id: img.id,
                        image_url: img.image_url,
                        is_main: img.is_main,
                    })) : [], // Ensure images is array
                    sizes: variant.sizes ? Object.entries(variant.sizes).map(([sizeName, sizeDetails]: [string, any]) => ({
                        name: sizeName,
                        quantity: sizeDetails.quantity,
                        measurements: sizeDetails.measurements,
                    })) : [], // Ensure sizes is object before entries, or default to empty array
                })),
                // ... rest of your productData transformation
                shippingDelivery: {
                    productId: editProductId,
                    weight: fetchedData.shippingDelivery?.weight || 0,
                    dimensions: {
                        length: fetchedData.shippingDelivery?.dimensions?.length || 0,
                        width: fetchedData.shippingDelivery?.dimensions?.width || 0,
                        height: fetchedData.shippingDelivery?.dimensions?.height || 0,
                    },
                    methods: {
                        sameDay: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'same_day' && m.zone_type === 'domestic') || { available: false, fee: 0 },
                        standard: {
                            domestic: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'standard' && m.zone_type === 'domestic') || { available: false, fee: 0 },
                            regional: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'standard' && m.zone_type === 'regional') || { available: false, fee: 0 },
                            sub_regional: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'standard' && m.zone_type === 'sub_regional') || { available: false, fee: 0 },
                        },
                        express: {
                            domestic: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'express' && m.zone_type === 'domestic') || { available: false, fee: 0 },
                            regional: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'express' && m.zone_type === 'regional') || { available: false, fee: 0 },
                            sub_regional: fetchedData.shippingDelivery?.shippingMethods?.find((m: any) => m.method_type === 'express' && m.zone_type === 'sub_regional') || { available: false, fee: 0 },
                        },
                    },
                },
                returnRefundPolicy: fetchedData.returnRefundPolicy || {
                    returnWindow: 0,
                    refundMethod: "replacement",
                    returnShipping: "free_returns",
                    conditions: "",
                },
                careInstructions: fetchedData.careInstructions || {
                    productId: editProductId,
                    washingInstruction: "",
                    bleachingInstruction: "",
                    dryingInstruction: "",
                    ironingInstruction: "",
                    dryCleaningInstruction: "",
                    specialCases: ""
                },
                release: fetchedData.release || {
                    isPublished: false,
                    releaseDate: "",
                    timeZone: "",
                }
            };

            setProductData(transformedProductData);
            setProductId(editProductId);
            // Only set variant saved status if there are actual variants
            if (variantsToMap.length > 0) {
                setVariantSavedStatus(Array(variantsToMap.length).fill(true));
            } else {
                setVariantSavedStatus([]); // No variants, no saved status
            }
            setIsAllDetailsSaved(true);
        } else if (editProductId && productDetails && !productDetails.success) {
            console.error("Failed to load product details:", productDetails.message);
        }
    }, [productDetails, editProductId]);

    // Consolidate loading states
    if (authLoading || productDetailsLoading) {
        return <LoadContent />;
    }

    if (authError) {
        console.error("Error getting user auth:", authError.message);
        // You might want to display this error to the user
    }

    if (productDetailsError) {
        console.error("Error getting product:", productDetailsError.message);
        // You might want to display this error to the user
    }

    if (!userId) {
        redirect("/login-brand");
        return null;
    }

    const contextValue = {
        productData,
        setProductData,
        productId,
        setProductId,
        isAllDetailsSaved,
        setIsAllDetailsSaved,
        userId,
        accessToken,
        variantSavedStatus,
        handleVariantSaved,
    };

    return (
        <ProductFormProvider value={contextValue}>
            <div className="container overflow-auto mx-auto px-0">
                <Toaster position="top-right" richColors />
                <div className="flex flex-col md:flex-row gap-8 h-full">
                    <div className="w-full md:w-3/4">
                        <AddProductDetails /> {/* This component should consume context */}
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
        </ProductFormProvider>
    );
};

export default AddProductForm;