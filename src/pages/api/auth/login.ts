import type { APIRoute } from "astro";

// Ensure this API route is server-rendered
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  let email: string | undefined;
  let password: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

    // Basic validation
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "Email and password are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error("Error parsing request body:", error);
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await locals.supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log the specific Supabase error for debugging, but return a generic message
    console.error("Supabase login error:", error.message);
    return new Response(JSON.stringify({ error: "Invalid login credentials." }), {
      status: 401, // Use 401 for authentication errors
      headers: { "Content-Type": "application/json" },
    });
  }

  // Although we don't explicitly return user data here for security,
  // Supabase handles setting the auth cookies via the server client's setAll mechanism.
  // The middleware will pick up the session on subsequent requests.
  return new Response(JSON.stringify({ message: "Login successful" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
