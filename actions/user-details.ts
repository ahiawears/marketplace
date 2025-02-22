import { createClient } from "@/supabase_change/server";

export const getUserDetails = async () => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
        return null;
    }
    
    // Access user details directly from the auth response
    const user = data.user;
    if (!user) {
        return null;
    }

    // Extract email and metadata fields (first_name and last_name)
    const { email, user_metadata: { first_name, last_name } = {} } = user;


    return { first_name, last_name, email };
}