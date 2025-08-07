import { createClient } from "@/supabase/server"

interface SizeData {
	id: string
	size_id: { name: string }
	quantity: number
	product_measurements?: Array<{
		measurement_type_id: { name: string }
		value: number
		measurement_unit: string
	}>
}
interface Color {
	id: string;
	name: string;
	hex_code: string;
}

interface ProductImage {
	id: string;
	image_url: string;
	is_main: boolean;
}

interface SizeDetails {
	quantity: number;
	measurements: {
		type: string;
		value: number;
		unit: string;
	}[];
}

interface Tag {
	tag_id: {
		name: string;
	};
}

interface SupabaseVariantData {
	id: string;
	main_product_id: string;
	name: string;
	color_id: Color;
	sku: string;
	price: number;
	base_currency_price: number;
	product_code: string;
	color_description: string;
	images_description: string;
	product_images: ProductImage[];
	relatedVariantIds: string[]; 
	sizes: Record<string, SizeDetails>;
	tags: Tag[] | null;
}

interface VariantResponse {
	success: boolean;
	data: SupabaseVariantData | null;
	error: string | null;
}


export const getVariantById = async (variantId: string): Promise<VariantResponse> => {
	const supabase = await createClient();
	// Helper function for consistent error responses
	const errorResponse = (message: string) => {
		return JSON.parse(JSON.stringify({
		error: message,
		data: null,
		success: false
		}));
	};

	// Helper function for successful responses
	const successResponse = (data: any) => {
			return JSON.parse(JSON.stringify({
				error: null,
				data,
				success: true
			})
		);
	};
	try {
		// Get variant data
		const { data, error: variantError } = await supabase
			.from('product_variants')
			.select(`
				id,
				main_product_id,
				name,
				color_id(name, id, hex_code),
				sku,
				price,
				base_currency_price,
				product_code,
				color_description,
				product_images(id, image_url, is_main),
				images_description
			`)
			.eq('id', variantId)
			.single()

		if (variantError) {
			throw new Error(variantError.message || "Could not fetch product details.");
		}
		
		if (!data) return { success: false, data: null, error: "Not found" };

		const variant = data as unknown as SupabaseVariantData;

		const { data: relatedVariants } = await supabase
			.from('product_variants')
			.select('id')
			.eq('main_product_id', variant.main_product_id)
			.neq('id', variantId);

		const { data: tagData } = await supabase
			.from('product_tags')
			.select('tag_id(name)')
			.eq('product_id', variant.main_product_id);

		// Get sizes with measurements
		const { data: sizes } = await supabase
			.from('product_sizes')
			.select(`
				id, 
				size_id(name), 
				quantity,
				product_measurements(
					measurement_type_id(name), 
					value, 
					measurement_unit
				)
			`)
			.eq('product_id', variantId);

		// Type assertion for sizes data
		const typedSizes = sizes as unknown as SizeData[];

		// Structure sizes data
		const sizesStructured = typedSizes?.reduce((acc, size) => {
			const sizeName = size.size_id.name;
			acc[sizeName] = {
				quantity: size.quantity,
				measurements: size.product_measurements?.map(m => ({
					type: m.measurement_type_id.name,
					value: m.value,
					unit: m.measurement_unit
				})) || []
			}
			return acc
		}, {} as Record<string, { quantity: number; measurements: any[] }>);

		const result = {
			...data,
			color_id: data.color_id ? { ...data.color_id } : null,
			product_images: data.product_images?.map(img => ({ ...img })) || [],
			relatedVariantIds: relatedVariants?.map(v => v.id) || [], 
			tags: tagData ? [...tagData] : null, 
			sizes: sizesStructured ? { ...sizesStructured } : {} 
		};

		return successResponse(result);

	} catch (error) {
		console.error("Error in getVariantById:", error);
		return errorResponse(
			error instanceof Error ? error.message : "Unknown error occurred"
		);
	}
}