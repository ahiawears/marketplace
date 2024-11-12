import { NextRequest, NextResponse } from 'next/server';
import { getProductItems } from '@/actions/brand-get-product-list';  
import { createClient } from '@/supabase/server';


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

        const userId = data.user?.id;
        if (!userId) {
            return NextResponse.json(
                { error: 'Brand ID required' },
                { status: 400 }
            );
        }

        const productsItem = await getProductItems(userId);

        if(!productsItem) {
            return NextResponse.json(
                { error: 'No Products items found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: productsItem });
    } catch (error) {
        console.error("Failed to fetch products items:", error);
        return NextResponse.json(
            { error: 'Failed to fetch products items' },
            { status: 500 }
        );
    }


}