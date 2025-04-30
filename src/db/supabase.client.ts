import { createServerClient, type CookieOptions, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

// Ensure environment variables are loaded
if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_KEY) {
  throw new Error("Supabase URL and Key must be provided in environment variables.");
}

export const cookieOptionsConfig: CookieOptionsWithName = {
  name: "sb-auth-token",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: "lax",
};

export interface CookieHandler {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: { name: string; value: string; options?: CookieOptionsWithName }[]) => void;
}

// Create a Supabase client for the current request, using AstroCookies type
export function createClient(cookies: AstroCookies): SupabaseClient<Database> {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value; // Use ?.value as per Astro/Supabase docs
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, options); // Directly use Astro's set
      },
      remove(name: string, options: CookieOptions) {
        cookies.delete(name, options); // Use Astro's delete method
      },
    },
  });
}

// Export a default Supabase client instance for direct use
export const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
  cookieOptions: cookieOptionsConfig,
  cookies: {
    get(name: string) {
      // Try to get cookie from document if available
      if (typeof document !== "undefined") {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : undefined;
      }
      return undefined;
    },
    set(name: string, value: string, options: CookieOptionsWithName) {
      if (typeof document !== "undefined") {
        let cookieString = `${name}=${value}`;
        if (options.path) cookieString += `; path=${options.path}`;
        if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
        if (options.domain) cookieString += `; domain=${options.domain}`;
        if (options.secure) cookieString += "; secure";
        if (options.httpOnly) cookieString += "; httpOnly";
        if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
        document.cookie = cookieString;
      }
    },
    remove(name: string, options: CookieOptionsWithName) {
      if (typeof document !== "undefined") {
        document.cookie = `${name}=; max-age=0${options.path ? `; path=${options.path}` : ""}`;
      }
    },
  },
});
