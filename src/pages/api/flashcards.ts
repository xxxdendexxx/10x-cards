// Import necessary modules
import { z } from "zod";
import type { CreateFlashcardCommand } from "../../types";
import { createFlashcards } from "../../lib/services/flashcards";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

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
export async function POST({ request }: { request: Request }) {
  try {
    // Step 2: Parse and validate request body
    const body = await request.json();
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

    // Step 3: Process creation of flashcards
    const createdFlashcards = await createFlashcards(parsedData, DEFAULT_USER_ID);

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
}
