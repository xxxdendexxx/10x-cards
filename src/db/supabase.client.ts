import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded
if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_KEY) {
  throw new Error("Supabase URL and Key must be provided in environment variables.");
}

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth-token",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: "lax",
};

export type SupabaseClient = BaseSupabaseClient<Database>;

export interface CookieHandler {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptionsWithName) => void;
}

export interface CreateClientOptions {
  headers: Headers;
  cookies: CookieHandler;
}

export function createSupabaseServerInstance({ headers, cookies }: CreateClientOptions): SupabaseClient {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get: (name: string) => cookies.get(name),
      set: (name: string, value: string, options: CookieOptionsWithName) => cookies.set(name, value, options),
    },
  });

  return supabase;
}
