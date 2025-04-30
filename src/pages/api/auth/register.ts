import type { APIRoute } from "astro";
import { createClient } from "../../../db/supabase.client";
import { z } from "zod";

// Schemat walidacji danych wejściowych
const registerSchema = z
  .object({
    email: z.string().email("Podaj poprawny adres email"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();

    // Walidacja danych wejściowych
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "validation_error",
          details: result.error.format(),
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Inicjalizacja klienta Supabase
    const supabase = createClient(cookies);

    // Rejestracja użytkownika
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Obsługa specyficznych błędów
      if (error.message.includes("email already registered")) {
        return new Response(JSON.stringify({ success: false, error: "email_exists" }), { status: 409 });
      }

      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: authData.user?.id, email: authData.user?.email },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Register API error:", err);
    return new Response(JSON.stringify({ success: false, error: "server_error" }), { status: 500 });
  }
};
