import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // Set anonymous ID if missing
  if (!request.cookies.has('anon_id')) {
    const anonId = crypto.randomUUID();
    response.cookies.set('anon_id', anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      path: '/'
    });
  }

  return response;
}
