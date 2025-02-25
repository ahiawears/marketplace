interface MeasurementSizesProps {
    measurements: {
        [size: string]: {
          [measurement: string]: number | string; // Measurements (e.g., "chest", "waist", etc.)
          quantity: number;
        };
    };
}

export async function createSizes(supabase: any, variantId: string, { measurements }: MeasurementSizesProps) {
    try {
        for (const sizeName in measurements) {
            const sizeData = measurements[sizeName];

            let { data: existingSize, error: sizeError } = await supabase
                .from("sizes")
                .select("id")
                .eq("name", sizeName)
                .maybeSingle();

            if (sizeError) throw new Error(`Error checking size '${sizeName}': ${sizeError.message}`);

            if (!existingSize) {
                const { data: newSize, error: newSizeError } = await supabase
                    .from("sizes")
                    .insert({ name: sizeName })
                    .select()
                    .single();

                if (newSizeError) throw new Error(`Error adding new size '${sizeName}': ${newSizeError.message}`);
                existingSize = newSize;
            }

            const { data: productSize, error: productSizeError } = await supabase
                .from("product_sizes")
                .insert({ product_id: variantId, size_id: existingSize.id, quantity: sizeData.quantity })
                .select()
                .single();

            if (productSizeError) throw new Error(`Error adding product size for '${sizeName}': ${productSizeError.message}`);
            if (!productSize) throw new Error(`Failed to insert product size for '${sizeName}'.`);

            for (const measurementType in sizeData) {
                if (measurementType === "quantity") continue;

                const measurementValue = sizeData[measurementType];
                if (measurementValue === undefined || measurementValue === null) {
                    console.warn(`Skipping measurement '${measurementType}' for size '${sizeName}' because value is missing.`);
                    continue;
                }

                console.log("Checking measurement type:", measurementType);

                let { data: measurementRecord, error: measurementError } = await supabase
                    .from("measurement_types")
                    .select("id")
                    .eq("name", measurementType)
                    .maybeSingle();

                if (measurementError) throw new Error(`Error checking measurement type '${measurementType}': ${measurementError.message}`);

                if (!measurementRecord) {
                    const { data: newMeasurement, error: newMeasurementError } = await supabase
                        .from("measurement_types")
                        .insert({ name: measurementType })
                        .select()
                        .single();

                    if (newMeasurementError) throw new Error(`Error adding measurement type '${measurementType}': ${newMeasurementError.message}`);

                    measurementRecord = newMeasurement;
                }

                if (!measurementRecord) throw new Error(`Failed to insert or find measurement type '${measurementType}'.`);

                console.log("Inserting measurement:", {
                    product_size_id: productSize.id,
                    measurement_type_id: measurementRecord.id,
                    value: measurementValue
                });

                const { data: insertedMeasurement, error: productMeasurementError } = await supabase
                    .from("product_measurements")
                    .insert({
                        product_size_id: productSize.id,
                        measurement_type_id: measurementRecord.id,
                        value: measurementValue
                    })
                    .select()
                    .single();

                if (productMeasurementError) {
                    throw new Error(`Error adding measurement '${measurementType}' for size '${sizeName}': ${productMeasurementError.message || "No error message provided"}`);
                }

                console.log("Inserted measurement:", insertedMeasurement);
            }
        }

        console.log("Sizes and measurements added successfully!");
    } catch (error) {
        console.error("Error inserting sizes and measurements:", error);
        throw error;
    }
}
