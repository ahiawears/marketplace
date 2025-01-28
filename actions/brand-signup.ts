import { createClient } from "@/supabase/server";
import { AddBrand } from "./add-brand";

type SignupProps = {
    email: string, 
    password: string,
}

export async function BrandSignUp({email, password}: SignupProps) {
    const supabase = await createClient();

    //Sign up the brand
    const {data, error} = await supabase.auth.signUp ({
        email: email,
        password: password, 
    });

    //If there is an error, display error
    if (error) {
        throw new Error(error.message || "An unexpected error occured, please try again.")
    }

    //check if user was signed up successfully
    if (!data.user) {
        throw new Error("User data is null");
    }

    try {
        const { error: addBrandError } = await AddBrand({
            id: data.user.id,
            brand_email: email,
        });

        if (addBrandError) {
            throw new Error(addBrandError.message);
        }
    } catch (error) {
        //delete user if AddBrand fails
        const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);

        //if theres an error, display error
        if (deleteError) {
            throw new Error (deleteError.message);
        }

        //through an unhandled error in case
        throw new Error("An unexpected error occurred, please try again.");
    }

}