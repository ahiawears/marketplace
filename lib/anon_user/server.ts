// src/lib/anonymous-user/server.ts
'use server';

import { cookies } from 'next/headers';

const ANONYMOUS_ID_COOKIE = 'anon_id';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getServerAnonymousId(): Promise<string> {
  const cookieStore = cookies(); // No await needed - cookies() is synchronous
  let anonId = (await cookieStore).get(ANONYMOUS_ID_COOKIE)?.value;
  
  if (!anonId) {
    anonId = crypto.randomUUID();
    (await cookieStore).set({
      name: ANONYMOUS_ID_COOKIE,
      value: anonId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
      path: '/'
    });
  }
  
  return anonId;
}

export async function clearServerAnonymousId(): Promise<void> {
  (await cookies()).delete(ANONYMOUS_ID_COOKIE);
}