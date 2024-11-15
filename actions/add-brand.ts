import { createClient } from "@/supabase/server";

type Props = {
    id: string;
    brand_email: string;
};

export async function AddBrand({id, brand_email}:Props) {
    const supabase = await createClient();

    const { data, error } = await supabase
                                    .from("brands")
                                    .insert({
                                        id,
                                        brand_email,
                                    });
    return {
        data, 
        error,
    };
}