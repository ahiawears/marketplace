'use server'

import { createClient } from "@/supabase/server";

export async function UpdateBrandDescription(userId: string, description: string) {
    const supabase = await createClient();
    try {
        const {error} = await supabase
            .from('brands_list')
            .update({description})
            .eq('id', userId);

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, message: "Brand description updated successfully." };
    } catch (error) {
        return { success: false, message: "An unexpected error occurred during the description upload process." };
    }
}