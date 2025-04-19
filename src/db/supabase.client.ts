import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName, type CookieOptions } from "@supabase/ssr";
import type { Database } from "../db/database.types"; // Ensure this path is correct

// Ensure environment variables are loaded
if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_KEY) {
  throw new Error("Supabase URL and Key must be provided in environment variables.");
}

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth-token", // Default name, consider if customization is needed
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // e.g., 1 week
  secure: import.meta.env.PROD, // Use secure cookies in production
  httpOnly: true,
  sameSite: "lax",
};

// Helper function to parse cookies from the request header
// Adjusted slightly from the guide for potential edge cases
function parseCookieHeader(cookieHeader: string | null): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }
  return cookieHeader
    .split(";")
    .map((cookie) => {
      // Use const for rest as it's not reassigned
      const [name, ...rest] = cookie.trim().split("=");
      const trimmedName = name.trim(); // Ensure name is trimmed, use a different variable
      const value = rest.join("=").trim(); // Ensure value is trimmed
      return { name: trimmedName, value };
    })
    .filter((cookie) => cookie.name); // Filter out potential empty parts
}

// Function to create a Supabase server client instance for Astro components/pages/API routes
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  // We already checked these exist at the top level
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        // Get cookies from the request headers
        return parseCookieHeader(context.headers.get("Cookie"));
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // Set cookies using Astro's API
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
          context.cookies.set(name, value, options)
        );
      },
    },
  });

  return supabase;
};
