"use server";

import { createClient } from "@/supabase/server";
import z from "zod";
import { revalidatePath } from "next/cache";

// Define a schema for validation. All fields are required.
const addressSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    country: z.string().min(1, 'Country is required'),
    region: z.string().min(1, 'Region is required'),
    countryCode: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required'),
    postCode: z.string().min(1, 'Post code is required'),
    county: z.string().min(1, 'County is required'),
    city: z.string().min(1, 'City name is required'),
    address: z.string().min(1, 'Address is required'),
});

// A standard interface for returning a response from the server action.
interface UserAddressResults {
    success: boolean;
    message?: string;
    errors?: { [key: string]: string[] | undefined };
    address?: {
        id: string;
        user_id: string;
        first_name: string;
        last_name: string;
        address: string;
        city: string;
        county: string;
        region: string;
        country: string;
        post_code: string;
        country_code: string;
        mobile: string;
        created_at: string;
        is_default: boolean;
    };
}

export async function addUserAddress(formData: FormData): Promise<UserAddressResults> {
    const supabase = await createClient();

    try {
        const rawFormData = Object.fromEntries(formData.entries());
        const validation = addressSchema.safeParse(rawFormData);

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            return { success: false, errors, message: 'Validation failed.' };
        }
        
        // Step 2: Fetch the authenticated user.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: 'User not authenticated.' };
        }

        const { count: existingAddressCount, error: countError } = await supabase
            .from("user_address")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (countError) {
            console.error("Error counting user addresses:", countError);
            return { success: false, message: "Could not validate existing addresses." };
        }
        
        const { firstName, lastName, country, region, countryCode, mobile, postCode, county, city, address } = validation.data;
        
        const userData = {
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            country: country, 
            region: region,
            city: city,
            county: county,
            address: address,
            mobile: mobile,
            post_code: postCode,
            country_code: countryCode,
            is_default: (existingAddressCount ?? 0) === 0,
        };
        
        const { data: insertedAddress, error } = await supabase
            .from("user_address")
            .insert(userData)
            .select(`
                id,
                user_id,
                first_name,
                last_name,
                address,
                city,
                county,
                region,
                country,
                post_code,
                country_code,
                mobile,
                created_at,
                is_default
            `)
            .single();

        if (error) {
            console.error("Error inserting address:", error);
            return { success: false, message: "Error inserting address." };
        }
        
        revalidatePath("/my-account");
        return { success: true, message: "Address saved successfully!", address: insertedAddress };

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}
