import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "../db/supabase.client";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/", // Assuming homepage is public
  "/auth/login",
  "/auth/register",
  // Add other public pages like reset password if they exist
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  // Add other public API endpoints if they exist
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async (context, next) => {
  // Create a Supabase client for this request
  // Try to get variables from Cloudflare runtime first, then fallback to import.meta.env for local dev
  const supabaseUrl = context.locals.runtime?.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseKey = context.locals.runtime?.env?.SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase URL or Key is not defined. Checked Cloudflare env (context.locals.runtime.env) and local .env (import.meta.env)."
    );
    // Return a generic error to the client
    return new Response("Server configuration error: Unable to initialize authentication service.", { status: 500 });
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, context.cookies);
  context.locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(context.url.pathname)) {
    return next();
  }

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
    error: getUserError, // Capture potential error during getUser
  } = await supabase.auth.getUser();

  // Log potential errors during user fetching, but don't block unless critical
  if (getUserError) {
    console.error("Error fetching user session in middleware:", getUserError.message);
    // Decide if you want to block requests here or proceed cautiously
  }

  if (user) {
    context.locals.user = {
      email: user.email,
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(context.url.pathname)) {
    // Redirect to login for protected routes
    return context.redirect("/auth/login");
  }

  return next();
});
