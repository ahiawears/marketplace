'use server'

import { createClient } from "@/supabase/server";
import z from "zod";
import { revalidatePath } from "next/cache";

// Define a more specific schema for a partial user update
const updateSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
});

interface MetaDataResults {
    success: boolean;
    message?: string;
    errors?: {
        firstName?: string[];
        lastName?: string[];
    };
}

export const updateUserMetaDetails = async (formData: FormData): Promise<MetaDataResults> => {
    const supabase = await createClient();
    const validation = updateSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validation.success) {
        // Convert Zod errors to a plain serializable object
        const errors = validation.error.flatten().fieldErrors;
        return { 
            success: false, 
            errors: {
                firstName: errors.firstName || [],
                lastName: errors.lastName || []
            } 
        };
    }

    const { data } = validation;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'User not authenticated.' };
    }

    const { error } = await supabase.auth.updateUser({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
        }
    });

    if (error) {
        console.error('Update Error:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/my-account');
    return { success: true, message: "User details updated successfully." };
}