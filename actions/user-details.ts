import { createClient } from "@/supabase/server";

export const getUserDetails = async () => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
    
    // Access user details directly from the auth response
    const user = data.user;
    if (!user) {
        console.error("User not found");
        return null;
    }

    // Extract email and metadata fields (first_name and last_name)
    const { email, user_metadata: { first_name, last_name } = {} } = user;

    console.log("The user firstname is", first_name, "The last name is", last_name, "The email is", email);

    return { first_name, last_name, email };
}