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

export const getVariantById = async (variantId: string) => {
  const supabase = await createClient()

  try {
    // Get variant data
    const { data: variant, error: variantError } = await supabase
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

    if (!variant) return null

    // Get related variants
    const { data: relatedVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('main_product_id', variant.main_product_id)
      .neq('id', variantId)

    // Get tags
    const { data: tagData } = await supabase
      .from('product_tags')
      .select('tag_id(name)')
      .eq('product_id', variant.main_product_id)

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
      .eq('product_id', variantId)

    // Type assertion for sizes data
    const typedSizes = sizes as unknown as SizeData[]

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
    }, {} as Record<string, { quantity: number; measurements: any[] }>)

    return {
      ...variant,
      relatedVariantIds: relatedVariants?.map(v => v.id) || [],
      tags: tagData,
      sizes: sizesStructured || {}
    }

  } catch (error) {
    console.error("Error fetching variant:", error)
    throw error
  }
}