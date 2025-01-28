import { signup } from "@/actions/signup";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName } = await req.json();
        
        await signup({ email, password, firstName, lastName })
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}