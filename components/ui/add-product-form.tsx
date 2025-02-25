"use client";

import { useEffect, useState } from "react";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";
import ProductPreviewModal from "../modals/product-preview-modal";
import ProductPreview from "../upload-product/product-preview";
import { ProductUploadData, ProductVariantType } from "../../lib/types";
import ModalBackdrop from "../modals/modal-backdrop";
import { addProduct } from "../../actions/uploadProduct";
import { useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/supabase/client";

const AddProductForm = () => {

    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [isGeneralDetailsComplete, setIsGeneralDetailsComplete] = useState<boolean>(false);
    const [isProductInformationComplete, setIsProductInformationComplete] = useState<boolean>(false);
    const [isGeneralDetailsSaved, setIsGeneralDetailsSaved] = useState<boolean>(false);
    const [isProductInformationSaved, setIsProductInformationSaved] = useState<boolean>(false);

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
		productInformation: {
			currentSlide: 0,
			main_image_url: "",
			productId: "",
			variantName: "",
			images: [],
			colorName: "",
			price: "",
			colorHex: "",
			sku: "",
			measurements: {},
            productCode: "",
		},
		productVariants: [],
	});

    const validateGeneralDetails = () => {
        const { productName, productDescription, category, currency, material } = productData.generalDetails;
        return (
            productName.trim() !== "" &&
            productDescription.trim() !== "" &&
            category.trim() !== "" &&
            currency.trim() !== "" &&
            material.trim() !== ""
        );
    };

    const validateProductInformation = () => {
        const { images, colorName, colorHex, price, sku, productCode, measurements } = productData.productInformation;
    
        // Check if all images are uploaded
        const areImagesUploaded = images.every((image) => image !== null);
    
        // Check if all required fields are filled
        const areFieldsFilled = (
            colorName.trim() !== "" &&
            colorHex.trim() !== "" &&
            price.trim() !== "" &&
            sku.trim() !== "" &&
            productCode.trim() !== ""
        );
    
        // Check if all selected sizes have a quantity
        const areMeasurementsValid = Object.keys(measurements).every(
            (size) => measurements[size].quantity
        );
    
        return areImagesUploaded && areFieldsFilled && areMeasurementsValid;
    };

    useEffect(() => {
        const isGeneralValid = validateGeneralDetails();
        const isProductInfoValid = validateProductInformation();

        setIsGeneralDetailsComplete(isGeneralValid);
        setIsProductInformationComplete(isProductInfoValid);

        // Enable Publish button only if both accordions are saved and there are no unsaved changes
        setIsFormValid(isGeneralDetailsSaved && isProductInformationSaved);

    }, [productData, isGeneralDetailsSaved, isProductInformationSaved]);

    const handleSaveProductInformation = () => {
        // Save logic for Product Information
        setIsProductInformationSaved(true);
    };

    const handleProductInformationChange = (field: keyof ProductVariantType, value: string | string[]) => {
        setProductData((prev) => ({
            ...prev,
            productInformation: {
                ...prev.productInformation,
                [field]: value,
            },
        }));
    };
    
	  
	const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);

	const handlePublishClick = async () => {
        event?.preventDefault();

        if (!isFormValid) {
            console.log("Form is not valid");
            return;
        }


	    //setPreviewModalOpen(true);
        const formData = new FormData();

        const measurementsJson = JSON.stringify(productData.productInformation.measurements);

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
        formData.append("variantName", productData.productInformation.variantName);
        formData.append("variantSku", productData.productInformation.sku);
        formData.append("variantPrice", productData.productInformation.price);
        formData.append("variantColorName", productData.productInformation.colorName);
        formData.append("variantColorHex", productData.productInformation.colorHex);
        formData.append("variantProductCode", productData.productInformation.productCode);
        formData.append("variantMeasurements", measurementsJson);
        // Add images
        const validImages = productData.productInformation.images.filter(image => image !== null);

        const convertBlobUrlToFile = async (blobUrl: string, index: number) => {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const file = new File([blob], `image-${index}.png`, { type: blob.type });
            return file;
        };

        const imageFiles = await Promise.all(
            validImages.map((blobUrl, index) => convertBlobUrlToFile(blobUrl, index))
        );
        
        imageFiles.forEach((image) => {
            console.log("image from front end is : ", image)
            formData.append("images", image);
        });
        // Add Main Variant Details End

        //Add other variants if available Begin
        formData.append("variants", JSON.stringify(productData.productVariants));
        //Add other variants if available End

        try {
            const { data: { session }, error } = await createClient().auth.getSession();

            console.log("Session Data:", session);
            console.log("Error:", error);
            if (error) {
                throw new Error("Failed to get session.");
            }
    
            if (!session) {
                throw new Error("User is not authenticated.");
            }
            

            console.log("Access Token:", session.access_token);

            const accessToken = session.access_token;
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }
            const res =  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-product`, 
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`, // Include the authorization header
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
                <div className="w-full md:w-2/3">
                    <AddProductDetails 
                        productData={productData} 
                        setProductData={setProductData}
                        onSaveProductInformation={handleSaveProductInformation}
                        setIsGeneralDetailsSaved={setIsGeneralDetailsSaved}
                        // onProductInformationChange={handleProductInformationChange}
                        // hasUnsavedChanges={hasUnsavedChanges}
                    />
                </div>
                <div className="w-full md:w-1/4 mt-12">
                    <PublishProduct onPublishClick={handlePublishClick} isFormValid={isFormValid}/>
                </div>

				{isPreviewModalOpen && (
                    <>
                        <div className="">
                            <ModalBackdrop disableInteraction={true}/>
                            <ProductPreviewModal onClose={closeModal}>
                                <ProductPreview
                                    productData={productData}
                                    selectedVariant={selectedVariant}
                                    onVariantClick={handleVariantClick}
                                />
                            </ProductPreviewModal>
                        </div>
                    </>
			    )}
            </div>
        </div>
    );
};

export default AddProductForm;
