/*
 * Service for flashcards operations
 * This service function handles the creation of flashcards and associates them with a userId.
 * In a real scenario, this would include a database transaction via Supabase client.
 */

import type { CreateFlashcardCommand, FlashcardDTO, FlashcardInsert } from "../../types";
import { supabaseClient } from "../../db/supabase.client";

export async function createFlashcards(command: CreateFlashcardCommand, userId: string): Promise<FlashcardDTO[]> {
  // Prepare records for insertion into the flashcards table
  const records: FlashcardInsert[] = command.flashcards.map((card) => ({
    id: crypto.randomUUID(),
    front: card.front,
    back: card.back,
    source: card.source,
    generation_id: card.generation_id,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Insert records into the flashcards table using Supabase client
  const { data, error } = await supabaseClient.from("flashcards").insert(records).select();

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from insert operation");
  }

  return data as FlashcardDTO[];
}
