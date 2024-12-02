import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function GET(req: NextRequest) {
    // // Await params to ensure they are fully resolved
    // await new Promise(resolve => setImmediate(resolve));

    // const id = params?.id; // Now you can safely access id

    // if (!id) {
    //     return NextResponse.json(
    //         { error: "Brand ID is required" },
    //         { status: 400 }
    //     );
    // }

    try {
        const supabase = await createClient(); // Create the Supabase client
        const { data: { user }, error: userError, } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }
        const id = user.id;
        console.log("The user Id is: ", id);

        const { data, error } = await supabase
            .from("brands_list")
            .select(`name, brands(brand_email)`)
            .eq("id", id)
            .single();

        if (error || !data) {
            console.error("Error fetching brand data:", error);
            return NextResponse.json(
                { error: "Brand not found" },
                { status: 404 }
            );
        }

        // Return fetched data as a JSON response
        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error("Error fetching brand details:", err);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
