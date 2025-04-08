interface MeasurementSizesProps {
    measurements: {
        [size: string]: {
          [measurement: string]: number | string; // Measurements (e.g., "chest", "waist", etc.)
          quantity: number;
        };
    };
}

export async function createSizes(
    supabase: any,
    variantId: string,
    { measurements }: MeasurementSizesProps,
    measurementUnit: string
) {
    try {
        // First delete existing sizes and measurements for this variant
        const { error: deleteError } = await supabase
            .from("product_sizes")
            .delete()
            .eq("product_id", variantId);
        
        if (deleteError) throw deleteError;

        for (const sizeName in measurements) {
            const sizeData = measurements[sizeName];

            // 1. Handle Size - use upsert to avoid duplicates
            const { data: sizeRecord, error: sizeError } = await supabase
                .from("sizes")
                .upsert(
                    { name: sizeName },
                    { onConflict: "name", ignoreDuplicates: false }
                )
                .select("id")
                .single();

            if (sizeError) throw sizeError;

            // 2. Create Product Size
            const { data: productSize, error: productSizeError } = await supabase
                .from("product_sizes")
                .insert({
                    product_id: variantId,
                    size_id: sizeRecord.id,
                    quantity: sizeData.quantity
                })
                .select("id")
                .single();

            if (productSizeError) throw productSizeError;

            // 3. Handle Measurements
            for (const measurementType in sizeData) {
                if (measurementType === "quantity") continue;
                const measurementValue = sizeData[measurementType];
                if (measurementValue === undefined || measurementValue === null) continue;

                // Use upsert for measurement type
                const { data: measurementTypeRecord, error: typeError } = await supabase
                    .from("measurement_types")
                    .upsert(
                        { name: measurementType },
                        { onConflict: "name", ignoreDuplicates: false }
                    )
                    .select("id")
                    .single();

                if (typeError) throw typeError;

                // Insert measurement
                const { error: measurementError } = await supabase
                    .from("product_measurements")
                    .insert({
                        product_size_id: productSize.id,
                        measurement_type_id: measurementTypeRecord.id,
                        value: measurementValue,
                        measurement_unit: measurementUnit
                    });

                if (measurementError) throw measurementError;
            }
        }
    } catch (error) {
        console.error("Error in createSizes:", error);
        throw error;
    }
}