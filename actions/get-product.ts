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

			if (!careInstructionsData) {
				throw new Error("Care instructions not found for this product.");
			}



			// Fetch Product Shipping Delivery Data
			// First we fetch the product physical attributes
			const { data: physicalAttributesData, error: physicalAttributesError } = await supabase
				.from('product_shipping_details')
				.select('weight, height, width, length')
				.eq('product_id', id)
				.single();

			if (physicalAttributesError) {
				throw new Error(physicalAttributesError.message);
			}

			if (!physicalAttributesData) {
				throw new Error("Physical attributes not found for this product.");
			}

			// Now we get the shipping configurations
			// const { data: shippingConfigData, error: shippingConfigError } = await supabase
			// 	.from('product_shipping_fees')
			// 	.select('')

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
					}
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
