// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAnonymousId } from './lib/anon_user/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set anonymous ID if missing
  if (!request.cookies.has('anon_id')) {
    const anonId = await getServerAnonymousId();
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