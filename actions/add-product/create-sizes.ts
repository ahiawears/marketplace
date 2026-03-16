interface MeasurementSizesProps {
    measurements: {
        [size: string]: {
            [measurement: string]: number | string | undefined;
            quantity: number | undefined;
        };
    };
}

type ExistingProductSizeRow = {
    id: string;
    size_id: string | null;
};

type ExistingMeasurementRow = {
    id: string;
    product_size_id: string | null;
    measurement_type_id: string | null;
};

export async function createSizes(
    supabase: any,
    variantId: string,
    { measurements }: MeasurementSizesProps,
    measurementUnit: string
) {
    try {
        const { data: existingProductSizes, error: existingSizesError } = await supabase
            .from("product_sizes")
            .select("id, size_id")
            .eq("product_id", variantId);

        if (existingSizesError) throw existingSizesError;

        const productSizesBySizeId = new Map<string, string>();
        for (const row of (existingProductSizes || []) as ExistingProductSizeRow[]) {
            if (row.size_id) {
                productSizesBySizeId.set(row.size_id, row.id);
            }
        }

        const { data: existingMeasurements, error: existingMeasurementsError } =
            existingProductSizes && existingProductSizes.length > 0
                ? await supabase
                    .from("product_measurements")
                    .select("id, product_size_id, measurement_type_id")
                    .in("product_size_id", existingProductSizes.map((row: ExistingProductSizeRow) => row.id))
                : { data: [], error: null };

        if (existingMeasurementsError) throw existingMeasurementsError;

        const keptSizeIds = new Set<string>();

        for (const sizeName in measurements) {
            const sizeData = measurements[sizeName];

            if (typeof sizeData.quantity !== "number" || sizeData.quantity <= 0) {
                continue;
            }

            const { data: sizeRecord, error: sizeError } = await supabase
                .from("sizes")
                .upsert({ name: sizeName }, { onConflict: "name", ignoreDuplicates: false })
                .select("id")
                .single();

            if (sizeError) throw sizeError;

            const { data: productSize, error: productSizeError } = await supabase
                .from("product_sizes")
                .upsert(
                    {
                        product_id: variantId,
                        size_id: sizeRecord.id,
                        quantity: sizeData.quantity,
                    },
                    { onConflict: "product_id,size_id" }
                )
                .select("id, size_id")
                .single();

            if (productSizeError) throw productSizeError;

            keptSizeIds.add(productSize.id);
            productSizesBySizeId.set(productSize.size_id, productSize.id);

            const keptMeasurementTypeIds = new Set<string>();

            for (const measurementType in sizeData) {
                if (measurementType === "quantity") continue;

                const measurementValue = sizeData[measurementType];
                if (measurementValue === undefined || measurementValue === null || measurementValue === "") {
                    continue;
                }

                const { data: measurementTypeRecord, error: typeError } = await supabase
                    .from("measurement_types")
                    .upsert({ name: measurementType }, { onConflict: "name", ignoreDuplicates: false })
                    .select("id")
                    .single();

                if (typeError) throw typeError;

                keptMeasurementTypeIds.add(measurementTypeRecord.id);

                const { error: measurementUpsertError } = await supabase
                    .from("product_measurements")
                    .upsert(
                        {
                            product_size_id: productSize.id,
                            measurement_type_id: measurementTypeRecord.id,
                            value: String(measurementValue),
                            measurement_unit: measurementUnit,
                        },
                        { onConflict: "product_size_id,measurement_type_id" }
                    );

                if (measurementUpsertError) throw measurementUpsertError;
            }

            const staleMeasurementIds = ((existingMeasurements || []) as ExistingMeasurementRow[])
                .filter((row) => row.product_size_id === productSize.id)
                .filter((row) => row.measurement_type_id && !keptMeasurementTypeIds.has(row.measurement_type_id))
                .map((row) => row.id);

            if (staleMeasurementIds.length > 0) {
                const { error: deleteMeasurementsError } = await supabase
                    .from("product_measurements")
                    .delete()
                    .in("id", staleMeasurementIds);

                if (deleteMeasurementsError) throw deleteMeasurementsError;
            }
        }

        const staleProductSizeIds = ((existingProductSizes || []) as ExistingProductSizeRow[])
            .filter((row) => !keptSizeIds.has(row.id))
            .map((row) => row.id);

        if (staleProductSizeIds.length > 0) {
            const { error: deleteSizesError } = await supabase
                .from("product_sizes")
                .delete()
                .in("id", staleProductSizeIds);

            if (deleteSizesError) throw deleteSizesError;
        }
    } catch (error) {
        console.error("Error in createSizes:", error);
        throw error;
    }
}
