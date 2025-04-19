import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

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
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(context.url.pathname)) {
    return next();
  }

  // Create a Supabase instance specific to this request
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers, // Use context.request.headers
  });

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
    // Store minimal user info on locals if needed by protected pages
    context.locals.user = {
      id: user.id,
      email: user.email,
      // Add any other necessary fields, but keep it minimal
    };
  } else {
    // If no user and the path is not public, redirect to login
    // Ensure API routes don't get redirected to HTML pages
    if (!context.url.pathname.startsWith("/api/")) {
      return context.redirect("/auth/login");
    }
    // For API routes, you might want to return a 401 Unauthorized instead
    // Or handle it within the API route itself
    // return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Proceed to the next middleware or the page
  return next();
});
