import { z } from "zod";
import type { APIContext } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcardsService";

export const prerender = false;

// Validation schema for UUID
const idSchema = z.string().uuid("ID must be a valid UUID");

// Validation schema for flashcard update
const flashcardUpdateSchema = z
  .object({
    front: z.string().max(200, "Front text must be 200 characters or less").optional(),
    back: z.string().max(500, "Back text must be 500 characters or less").optional(),
    source: z.enum(["ai-full", "ai-edited", "manual"] as const).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (front, back, or source) must be provided for update",
  });

export async function PUT({ params, request, locals }: APIContext) {
  // Check authentication
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate ID parameter
  let flashcardId: string;
  try {
    flashcardId = idSchema.parse(params.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse and validate request body
  let updateData;
  try {
    const body = await request.json();
    updateData = flashcardUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Call service to update flashcard
  try {
    const flashcardsService = new FlashcardsService({ params, request, locals } as APIContext);
    const updatedFlashcard = await flashcardsService.updateFlashcard(flashcardId, updateData);

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error updating flashcard:", error);
      return new Response(JSON.stringify({ error: "Server error occurred" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
