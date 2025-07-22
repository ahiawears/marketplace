// @ts-ignore
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export function createClient(accessToken?: string) {
  // @ts-ignore (Ignore TypeScript error about 'Deno'
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  // @ts-ignore (Ignore TypeScript error about 'Deno'
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  if (accessToken) {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
  
  // @ts-ignore (Ignore TypeScript error about 'Deno')
  return createSupabaseClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
 