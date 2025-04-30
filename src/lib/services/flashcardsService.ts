import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardsListResponseDTO, FlashcardDTO } from "../../types";

interface ListFlashcardsParams {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "updated_at";
  filter?: "ai-full" | "ai-edited" | "manual";
}

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listFlashcards(userId: string, params: ListFlashcardsParams): Promise<FlashcardsListResponseDTO> {
    const { page, pageSize, sortBy, filter } = params;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize - 1;

    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      })
      .eq("user_id", userId)
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
}
