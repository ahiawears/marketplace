'use server'

import { createClient } from "@/supabase/server";

export async function UpdateBrandDescription(userId: string, description: string) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "User not authenticated." };
        }

        if (user.id !== userId) {
            return { success: false, message: "You are not allowed to update this brand." };
        }

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
