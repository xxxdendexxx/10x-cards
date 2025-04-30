import { PUT } from "../flashcards";
import { z } from "zod";
import type { APIContext } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcardsService";

export const prerender = false;

export { PUT };

/**
 * DELETE endpoint for soft-deleting a flashcard
 * Sets is_deleted=true in the database instead of physically removing the record
 */
export async function DELETE({ params, locals }: APIContext) {
  // Authentication is handled by middleware, but we add an extra check here
  if (!locals.user) {
    return new Response(null, { status: 401 });
  }

  // Validate the ID parameter is a valid UUID
  const idSchema = z.string().uuid();
  const parseResult = idSchema.safeParse(params.id);

  if (!parseResult.success) {
    return new Response(null, { status: 400 });
  }

  const flashcardId = parseResult.data;

  // Use the service to soft-delete the flashcard
  const flashcardsService = new FlashcardsService({ locals, params } as APIContext);
  const result = await flashcardsService.softDeleteFlashcard(flashcardId);

  if (!result.success) {
    if (result.error === "not_found" || result.error === "unauthorized") {
      // Return 404 for both not found and unauthorized to avoid information disclosure
      return new Response(null, { status: 404 });
    } else {
      // Log server errors (would be implemented in a real system)
      console.error(`Error soft-deleting flashcard ${flashcardId}:`, result.error);
      return new Response(null, { status: 500 });
    }
  }

  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
}
