"use server";

import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  console.log("The next value is ", next);

    if (token_hash && type && next) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            // redirect user to specified redirect URL or root of app
            console.log(`The next value is ${next}`)
            redirect(next)
        }

        if (error) {
          throw new Error(error.message);
        }
    }

  // redirect the user to an error page with some instructions
  redirect('/error')
}