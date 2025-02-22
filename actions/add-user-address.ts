"use server";

import { createClient } from "@/supabase_change/server";

export async function addUserAddress(formData: FormData) {
    const supabase = await createClient();

    // Fetch authenticated user
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Error fetching user:", error);
        return { error: "User not authenticated", status: 401 };
    }

    const userId = data.user?.id;
    if (!userId) {
        return { error: "User ID required", status: 400 };
    }

    // Extract and validate form data
    const country = formData.get("countryName");
    const countryCode = formData.get("countryCode");
    const mobile = formData.get("mobile");
    const postCode = formData.get("postCode");
    const county = formData.get("county");
    const city = formData.get("city");
    const address = formData.get("address");

    if (!country || !countryCode || !mobile || !city || !address) {
        return { error: "Missing required fields", status: 400 };
    }

    // Prepare user data
    const userData = {
        country: country as string,
        country_code: countryCode as string,
        mobile: mobile as string,
        post_code: postCode as string,
        county: county as string,
        city: city as string,
        address: address as string,
        user_id: userId,
    };

    // Insert data into "user_address" table
    const { data: userAddress, error: userAddressError } = await supabase
        .from("user_address")
        .insert(userData);

    if (userAddressError) {
        console.error("Error inserting address:", userAddressError);
        return { error: "Error inserting address", status: 500 };
    }

    // Return success response
    return { message: "Address saved successfully", data: userAddress, status: 200 };
}
