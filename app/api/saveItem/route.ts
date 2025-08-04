import { NextRequest, NextResponse } from 'next/server';
import { saveProduct } from '@/actions/user-actions/userSavedProductActions/save-product'

export async function POST(req: NextRequest) {
    try{
        const { variantId, size } = await req.json();

        const userType = req.nextUrl.searchParams.get('userType');
        const userId = req.nextUrl.searchParams.get('Id');
        const path = req.nextUrl.searchParams.get('path');

        if (!variantId) {
            console.log("Invalid request! Variant id is missing");
            return NextResponse.json({
                success: false,
                message: 'Invalid request! Variant id is missing',
                data: null
            }, { status: 400 });
        }

        if (!userType || !userId || !path) {
            console.log("Invalid request! user type or user id or path is missing");
            return NextResponse.json({
                success: false,
                message: 'Invalid request! User type or user id or path is missing',
                data: null
            }, { status: 400 })
        }

        const { success, id, isSaved, error } = await saveProduct({variantId, size, isAnonymous: userType === 'anonymous', userId, path});

        if (success) {
            return NextResponse.json({ success, id, isSaved }, { status: 200 });
        } else {
            return NextResponse.json({ success, error }, { status: 500 });
        }
    } catch (error) {
        console.log(error instanceof Error ? error.message : "An unexpected error occured");
        return NextResponse.json({
            success: false, 
            message: error instanceof Error ? error.message : "An unexpected error occured",
            data: null
        }, {
            status: 500
        })
    }
}