import { NextRequest, NextResponse } from 'next/server';
import { getCartItems } from '@/actions/user-actions/userCartActions/getCartItems';
 
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userType = searchParams.get('userType');
        const userId = searchParams.get('Id');
        const isAnonymous = userType === 'anonymous';
        
        if (!userType || !userId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid request! User Type or User Id is Missing',
                data: null
            }, { status:  400 });
        }

        const cartItems = await getCartItems(isAnonymous, userId);
        return NextResponse.json({
            success: true,
            message: "Cart items fetched successfully",
            data: cartItems
        }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch cart items:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occured",
        },{ status: 500 });
    }
}
