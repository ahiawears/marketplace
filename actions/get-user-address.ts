import { createClient } from "@/supabase/server"

export const getUserAddress = async (userId: string) => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_address")
        .select(`*`)
        .eq("user_id", userId);


    if (error) {
        throw new Error("Failed to fetch User Address");
    }

    if (!data || data.length === 0) {
        return [];
    }

    return data;
}