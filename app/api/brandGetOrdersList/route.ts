import { getOrderItems } from "@/actions/brand-get-order-list";
import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error fetching brand:", error); 
            return NextResponse.json(
                { error: 'Brand not authenticated' },
                { status: 401 }
            );
        }

        const brandID = data.user?.id;
        if (!brandID) {
            return NextResponse.json(
                { error: 'Brand ID required' },
                { status: 400 }
            );
        }

        const orderItems = await getOrderItems(brandID);

        if(!orderItems) {
            return NextResponse.json(
                { error: 'No Order items found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: orderItems });
    } catch (error) {
        console.error("Failed to fetch order items:", error);
        return NextResponse.json(
            { error: 'Failed to fetch order items' },
            { status: 500 }
        );
    }
}