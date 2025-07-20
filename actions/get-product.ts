export async function getProductForEdit (supabase: any, id: string){
	const fetchProductDetails = async () => {

		try {
			if (!id) {
				console.error("Product ID is required.");
				throw new Error("Product ID is required.");
			}

			//Fetch the general product details first
			const { data: generalProductDetailsData, error: generalProductDetailsError } = await supabase
				.from('products_list')
				.select(
					'name, product_description, category_id(name), subcategory_id(name), material_id(name), gender_id(name), season_id(name)'
				)
				.eq('id', id)
				.single();

			if (generalProductDetailsError) {
				throw new Error(generalProductDetailsError.message);
			}

			if (!generalProductDetailsData) {
				throw new Error("Product not found.");
			}

			// Fetch the tag data 
			const { data: tagData, error: tagError } = await supabase
				.from('product_tags')
				.select('tag_id(name)')
				.eq('product_id', id);

			if (tagError) {
				throw new Error(tagError.message);
			}

			if (!tagData || tagData.length === 0) {
				throw new Error("No tags found for this product.");
			}


			// Fetch care instructions
			const { data: careInstructionsData, error: careInstructionsError } = await supabase
				.from('product_care_instructions')
				.select('washing_instruction, bleaching_instruction, drying_instruction, ironing_instruction, dry_cleaning_instruction, special_cases')
				.eq('product_id', id)
				.single();

			if (careInstructionsError) {
				throw new Error(careInstructionsError.message);
			}


			// Fetch Product Shipping Delivery Data
			// First we fetch the product physical attributes
			const { data: physicalAttributesData, error: physicalAttributesError } = await supabase
				.from('product_shipping_details')
				.select('id, weight, height, width, length')
				.eq('product_id', id)
				.single();

			if (physicalAttributesError) {
				throw new Error(physicalAttributesError.message);
			}

			// Now we get the shipping configurations data
			const { data: shippingConfigData, error: shippingConfigError } = await supabase
				.from('product_shipping_fees')
				.select('available, fee, zone_type, method_type')
				.eq('product_shipping_id', physicalAttributesData.id);

			if (shippingConfigError) {
				throw new Error(shippingConfigError.message);
			}


			//Fetch the product variants data
			const { data: productVariantsData, error: productVariantsError } = await supabase
				.from('product_variants')
				.select('id, name, images_description, price, sku, product_code, color_id(name, hex_code), base_currency_price, color_description, available_date')
				.eq('main_product_id', id);

			if (productVariantsError) {
				throw new Error(productVariantsError.message);
			}

			 // Initialize an array to hold variants with their images, sizes, and measurements
            const variantsWithDetails: any[] = [];

            // Iterate through each product variant to fetch its images, sizes, and measurements
            for (const variant of productVariantsData) {
                // Fetch the variant images
                const { data: variantImages, error: variantImagesError } = await supabase
                    .from('product_images')
                    .select('id, image_url, is_main')
                    .eq('product_variant_id', variant.id); // Assuming product_variant_id links images to variants

                if (variantImagesError) {
                    throw new Error(variantImagesError.message);
                }

                const imagesForVariant = variantImages || [];

                // Get the product size ids for the current variant
                const { data: productSizesForVariant, error: productSizeIdsError } = await supabase
                    .from('product_sizes')
                    .select('id, size_id(name), quantity')
                    .eq('product_id', variant.id);

                if (productSizeIdsError) {
                    throw new Error(productSizeIdsError.message);
                }

                const sizesStructured: { [key: string]: { quantity: number, measurements: any[] } } = {};

                if (productSizesForVariant && productSizesForVariant.length > 0) {
                    // For each size, fetch its measurements
                    for (const size of productSizesForVariant) {
                        const { data: productMeasurements, error: productMeasurementsError } = await supabase
                            .from('product_measurements')
                            .select('measurement_type_id(name), value, measurement_unit')
                            .eq('product_size_id', size.id);

                        if (productMeasurementsError) {
                            throw new Error(productMeasurementsError.message);
                        }

                        // Restructure measurements for the desired output
                        const measurementsArray = (productMeasurements || []).map((m: any) => ({
                            type: m.measurement_type_id.name,
                            value: m.value,
                            unit: m.measurement_unit,
                        }));

                        // Populate the sizes object with nested structure
                        sizesStructured[size.size_id.name.toLowerCase()] = {
                            quantity: size.quantity,
                            measurements: measurementsArray,
                        };
                    }
                }

                variantsWithDetails.push({
                    ...variant, // Spread all existing variant properties
                    images: imagesForVariant, // Add the images array to the variant
                    sizes: sizesStructured, // Add the restructured sizes and measurements
                });
            }



			return {
				success: true,
				data: {
					generalDetails: {
						name: generalProductDetailsData.name,
						description: generalProductDetailsData.product_description,
						category: generalProductDetailsData.category_id.name,
						subcategory: generalProductDetailsData.subcategory_id.name,
						material: generalProductDetailsData.material_id.name,
						gender: generalProductDetailsData.gender_id.name,
						season: generalProductDetailsData.season_id.name,
						tags: tagData,
					},
					careInstructions: {
						washingInstruction: careInstructionsData.washing_instruction,
						bleachingInstruction: careInstructionsData.bleaching_instruction,
						dryingInstruction: careInstructionsData.drying_instruction,
						ironingInstruction: careInstructionsData.ironing_instruction,
						dryCleaningInstruction: careInstructionsData.dry_cleaning_instruction,
						specialCases: careInstructionsData.special_cases,
					},
					shippingDelivery:  {
						weight: physicalAttributesData.weight,
						dimensions: {
							length: physicalAttributesData.length,
							width: physicalAttributesData.width,
							height: physicalAttributesData.height,
						},
						shippingMethods: shippingConfigData,
					},
					variants: {
						variants: variantsWithDetails,
					},
				}
			}

		} catch (error) {
			console.error("Error fetching product for edit:", error);
			return {
				success: false,
				message: (error as Error).message || "An unknown error occurred while fetching product for edit.",
			};
		}
	}

	return fetchProductDetails();
};
