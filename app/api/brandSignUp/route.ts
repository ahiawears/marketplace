import { NextResponse } from 'next/server';
import { BrandSignUp } from '@/actions/brand-signup';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json(); 

        await BrandSignUp({ email, password });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
