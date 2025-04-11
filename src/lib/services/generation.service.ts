import crypto from "crypto";

import { DEFAULT_USER_ID, supabaseClient } from "../../db/supabase.client";
import type { FlashcardProposalDTO } from "../../types";

export class GenerationService {
  private static generateHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  static async createGeneration(sourceText: string): Promise<number> {
    const sourceTextHash = this.generateHash(sourceText);

    const { data: generation, error: insertError } = await supabaseClient
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
        model: "gpt-4", // TODO: Move to config
        generation_duration: 0,
        generated_count: 0,
      })
      .select()
      .single();

    if (insertError || !generation) {
      throw new Error(`Błąd podczas zapisywania metadanych generacji: ${insertError?.message}`);
    }

    return generation;
  }

  static async updateGenerationMetadata(generationId: number, duration: number, count: number): Promise<void> {
    const { error } = await supabaseClient
      .from("generations")
      .update({
        generation_duration: duration,
        generated_count: count,
      })
      .eq("id", generationId);

    if (error) {
      throw new Error(`Błąd podczas aktualizacji metadanych generacji: ${error.message}`);
    }
  }
}

export class MockAIService {
  static async generateFlashcards(sourceText: string): Promise<FlashcardProposalDTO[]> {
    // Symulacja opóźnienia odpowiedzi od AI
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Przykładowe fiszki wygenerowane na podstawie długości tekstu
    const numberOfFlashcards = Math.min(5, Math.floor(sourceText.length / 1000));

    return Array.from({ length: numberOfFlashcards }, (_, index) => ({
      front: `Przykładowa fiszka ${index + 1} - przód`,
      back: `Przykładowa fiszka ${index + 1} - tył`,
      source: "ai-full" as const,
    }));
  }
}
