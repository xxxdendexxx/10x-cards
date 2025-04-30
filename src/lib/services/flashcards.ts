/*
 * Service for flashcards operations
 * This service function handles the creation of flashcards and associates them with a userId.
 * In a real scenario, this would include a database transaction via Supabase client.
 */

import type { APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { CreateFlashcardCommand, FlashcardDTO, FlashcardInsert } from "../../types";

export async function createFlashcards(
  command: CreateFlashcardCommand,
  context: APIContext // Accept APIContext
): Promise<FlashcardDTO[]> {
  // Retrieve supabase and userId from context.locals
  const supabase = context.locals.supabase as SupabaseClient<Database>;
  const userId = context.locals.user?.id;

  if (!supabase) {
    throw new Error("Supabase client not found in context.locals");
  }
  if (!userId) {
    throw new Error("User not found in context.locals");
  }

  // Prepare records for insertion into the flashcards table
  const records: FlashcardInsert[] = command.flashcards.map((card) => ({
    id: crypto.randomUUID(),
    front: card.front,
    back: card.back,
    source: card.source,
    generation_id: card.generation_id,
    user_id: userId, // Use userId from context
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Insert records into the flashcards table using the Supabase client from context
  const { data, error } = await supabase.from("flashcards").insert(records).select();

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from insert operation");
  }

  return data as FlashcardDTO[];
}
