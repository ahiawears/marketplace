import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

interface UserAddress {
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
}

export const getUserAddress = async (): Promise<UserAddress[]> => {
    try {
        const supabase = await createClient();
        
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            redirect('/log-in');
        }

        // Fetch addresses from database
        const { data, error } = await supabase
            .from("user_address")
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
            .eq("user_id", user.id)
            .order('created_at', { ascending: false }); // Optional: sort by newest first

        if (error) {
            console.error('Supabase error:', error);
            throw new Error("Failed to fetch user addresses. Please try again later.");
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Type assertion to ensure we're returning properly typed data
        return data as UserAddress[];
    } catch (error) {
        console.error('Error in getUserAddress:', error);
        
        // Handle different error types
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        
        throw new Error("An unexpected error occurred while fetching addresses.");
    }
};