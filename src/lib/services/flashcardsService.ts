import type { APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardsListResponseDTO, FlashcardDTO, FlashcardUpdateDto } from "../../types";

interface ListFlashcardsParams {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "updated_at";
  filter?: "ai-full" | "ai-edited" | "manual";
}

export class FlashcardsService {
  private context: APIContext;

  constructor(context: APIContext) {
    if (!context.locals.supabase) {
      throw new Error("Supabase client not found in context.locals");
    }
    if (!context.locals.user?.id) {
      throw new Error("User not found in context.locals");
    }
    this.context = context;
  }

  private get supabase(): SupabaseClient<Database> {
    // We already checked in the constructor, but good practice to double-check
    if (!this.context.locals.supabase) {
      throw new Error("Supabase client not available in context.locals");
    }
    return this.context.locals.supabase;
  }

  private getUserId(): string {
    // We already checked in the constructor
    if (!this.context.locals.user?.id) {
      throw new Error("User not found in context.locals");
    }
    return this.context.locals.user.id;
  }

  async listFlashcards(params: ListFlashcardsParams): Promise<FlashcardsListResponseDTO> {
    const userId = this.getUserId(); // Get userId from context
    const { page, pageSize, sortBy, filter } = params;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize - 1;

    let query = this.supabase // Use the getter
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      })
      .eq("user_id", userId) // Use userId from context
      .eq("is_deleted", false)
      .order(sortBy, { ascending: false })
      .range(startIndex, endIndex);

    if (filter) {
      query = query.eq("source", filter);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: (data || []) as FlashcardDTO[],
      pagination: {
        page,
        pageSize,
        total: count || 0,
      },
    };
  }

  /**
   * Updates a flashcard with the specified changes
   * @param flashcardId - UUID of the flashcard to update
   * @param updateData - Object containing fields to update (front, back, source)
   * @returns The updated flashcard
   * @throws Error if the flashcard is not found or cannot be updated
   */
  async updateFlashcard(flashcardId: string, updateData: FlashcardUpdateDto): Promise<FlashcardDTO> {
    const userId = this.getUserId();

    // Perform the update operation
    const { data, error } = await this.supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }

    if (!data) {
      throw new Error("Flashcard not found");
    }

    return data as FlashcardDTO;
  }

  /**
   * Soft deletes a flashcard by setting is_deleted=true
   * @param flashcardId - UUID of the flashcard to delete
   * @returns An object indicating the result of the operation
   */
  async softDeleteFlashcard(
    flashcardId: string
  ): Promise<{ success: boolean; error?: "not_found" | "unauthorized" | "db_error" }> {
    const userId = this.getUserId();

    try {
      // First check if the flashcard exists and belongs to the user
      const { data: flashcard, error: findError } = await this.supabase
        .from("flashcards")
        .select("id, user_id")
        .eq("id", flashcardId)
        .eq("is_deleted", false)
        .single();

      if (findError) {
        return { success: false, error: "not_found" };
      }

      if (!flashcard) {
        return { success: false, error: "not_found" };
      }

      if (flashcard.user_id !== userId) {
        return { success: false, error: "unauthorized" };
      }

      // Perform the soft delete operation
      const { error: updateError } = await this.supabase
        .from("flashcards")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", flashcardId);

      if (updateError) {
        return { success: false, error: "db_error" };
      }

      return { success: true };
    } catch {
      return { success: false, error: "db_error" };
    }
  }
}
