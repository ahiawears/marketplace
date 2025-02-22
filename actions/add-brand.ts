"use server";

import { createClient } from "@/supabase_change/server";

type Props = {
    id: string;
    brand_email: string;
};

export async function AddBrand({id, brand_email}:Props) {
    const supabase = await createClient();

    const { data, error } = await supabase
                                    .from("brands")
                                    .insert({
                                        id,
                                        brand_email,
                                    });
    return {
        data, 
        error,
    };
}

export const AddBrandDetails = async (formData: FormData) => {

    try {
        console.log("Input data: ", formData);

        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error("Error getting user details:", authError);
            throw new Error("User authentication failed.");
        }

        const userId = authData.user?.id;
        console.log("Brand ID:", userId);

        if (!userId) {
            console.log("User not signed in, redirecting to signup.");
            return;
        }
        const brandName = formData.get("brandName") as string;
        const brandDescription = formData.get("description") as string;
        const brandLogo = formData.get("logoUrl") as File;

        console.log("The brands name is : ", brandName, "The brand description is : ", brandDescription);

        if (!brandName || !brandDescription ) {
            throw new Error("Brand name, description, and logo are required.");
        }

        // Upload the logo to Supabase Storage
        const logoFileName = `${brandName.toLowerCase().replace(/\s+/g, "-")}-logo-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("brand-logo")
            .upload(`brand-logo/${logoFileName}`, brandLogo, { contentType: brandLogo.type });

        if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw new Error("Failed to upload logo.");
        }

        // Get the public URL of the uploaded logo
        const { data: publicUrlData } = supabase.storage
            .from("brand-logo")
            .getPublicUrl(`brand-logo/${logoFileName}`);

        if (!publicUrlData?.publicUrl) {
            throw new Error("Failed to retrieve public URL for the logo.");
        }

        const brandLogoUrl = publicUrlData.publicUrl;
        console.log("The brand logo url is : ", brandLogoUrl);

        // Insert the brand details into the database
        const { data: insertData, error: insertError } = await supabase
            .from("brands_list")
            .insert({
                id: userId, 
                name: brandName,
                description: brandDescription,
                logo_url: brandLogoUrl,
            })
            .select();

        if (insertError) {
            console.error("Error inserting brand details:", insertError);
            throw new Error("Failed to insert brand details into the database.");
        }

        console.log("Brand details successfully inserted:", insertData);

        return { success: true, data: insertData };

    } catch (error) {
        console.error("Error in AddBrandDetails:", error);
        throw new Error((error as Error).message);
    }
    
}