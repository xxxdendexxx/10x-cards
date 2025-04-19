import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client"; // Adjusted path based on common structure

export const prerender = false; // Ensure this endpoint is server-rendered

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error.message);
    // Optionally, redirect to an error page or return a specific error response
    // For now, we'll still attempt to redirect to login, but log the error
    // return new Response(JSON.stringify({ error: 'Failed to sign out' }), { status: 500 });
  }

  // Redirect to the login page after sign out, regardless of error (as per user request)
  // Supabase client handles cookie clearing on signOut
  return redirect("/auth/login", 303); // Use 303 See Other for POST redirect
};
