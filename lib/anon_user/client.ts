// src/lib/anon_user/client.ts
'use client';

export function getClientAnonymousId(): string {
  // Only run in browser environment
  if (typeof window === 'undefined') return '';
  
  const ANONYMOUS_ID_COOKIE = 'anon_id';
  let anonId = localStorage.getItem(ANONYMOUS_ID_COOKIE);
  
  if (!anonId && typeof crypto !== 'undefined') {
    anonId = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_COOKIE, anonId);
  }
  
  return anonId || '';
}

export function clearClientAnonymousId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('anon_id');
  }
}