import { createClient } from "@/supabase/server";

export const getAllBrands = async () => {
    const supabase = await createClient();

    const { data: brandsList, error: brandsListError } = await supabase
        .from("brands_list")
        .select('id, name, description, logo, banner')
        .order("name", {
            ascending: true
        })
        .eq("verification_status", true);

    //throw just the error
    if (brandsListError) {
        throw new Error(`${brandsListError.message}`);
    }

    // If no brands found, return an empty array or handle as per your UI's needs
    if (!brandsList || brandsList.length === 0) {
        return [];
    }

    // Use Promise.all to fetch legal details concurrently for better performance
    const brandsWithLegalDetails = await Promise.all(
        brandsList.map(async (brand) => {
            const { data: legalDetails, error: legalDetailsError } = await supabase
                .from("brand_legal_details")
                .select('business_registration_name, business_registration_number, country_of_registration')
                .eq("id", brand.id)
                .single();

            if (legalDetailsError && legalDetailsError.code !== 'PGRST116') { // PGRST116 is "No rows found"
                // Log or handle other errors, but don't throw for "no rows found" if it's expected
                console.error(`Error fetching legal details for brand ${brand.id}:`, legalDetailsError.message);
            }

            // Attach legal details to the brand object
            // If legalDetails is null (no rows found), it will be null, otherwise it will be the object
            return {
                ...brand,
                legal_details: legalDetails
            };
        })
    );

    return brandsWithLegalDetails;
};