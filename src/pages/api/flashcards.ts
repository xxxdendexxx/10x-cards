// Import necessary modules
import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateFlashcardCommand } from "../../types";
import { createFlashcards } from "../../lib/services/flashcards";
import { createSupabaseServerInstance } from "../../db/supabase.client";

// Define flashcard schema with validation rules
const flashcardSchema = z
  .object({
    front: z.string().max(200),
    back: z.string().max(500),
    source: z.enum(["ai-full", "ai-edited", "manual"]),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // For manual flashcards, generation_id must be null; otherwise, it must be a number
      if (data.source === "manual") {
        return data.generation_id === null;
      }
      return data.generation_id !== null;
    },
    {
      message: "For 'ai-full' and 'ai-edited', generation_id must be a number, and for 'manual' must be null",
      path: ["generation_id"],
    }
  );

// Define the overall request schema
const createFlashcardCommandSchema = z.object({
  flashcards: z.array(flashcardSchema),
});

// POST endpoint for creating flashcards
export const POST: APIRoute = async (context) => {
  // Check if user is authenticated
  if (!context.locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = context.locals.user.id;

  try {
    // Step 2: Parse and validate request body
    const body = await context.request.json();
    let parsedData: CreateFlashcardCommand;
    try {
      parsedData = createFlashcardCommandSchema.parse(body);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: "Invalid request data", details: errMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create Supabase client instance
    const supabase = createSupabaseServerInstance({ cookies: context.cookies, headers: context.request.headers });

    // Step 3: Process creation of flashcards, passing supabase instance and userId
    const createdFlashcards = await createFlashcards(parsedData, userId, supabase);

    // Respond with the created flashcards
    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Global error handling
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
