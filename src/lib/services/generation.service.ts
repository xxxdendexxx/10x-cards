import crypto from "crypto";
import { OpenRouterService } from "./openrouter.service";
import type { GenerationCreateResponseDTO } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

export class GenerationService {
  private static generateHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private static openRouterService: OpenRouterService | null = null;

  private static initializeOpenRouter(): void {
    // console.log("Environment variables:", {
    //   OPENROUTER_API_KEY: import.meta.env.OPENROUTER_API_KEY,
    // });

    if (!this.openRouterService) {
      this.openRouterService = new OpenRouterService({
        apiKey: import.meta.env.OPENROUTER_API_KEY || "",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",

        systemMessage:
          "You are an AI tutor that creates flashcards from provided text. Your task is to extract key concepts and create question-answer pairs that will help in learning the material. Each flashcard should be concise and focus on a single concept.",
        modelName: "openai/gpt-4o-mini",
        modelParams: {
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        },
      });
    }
  }

  static async createGeneration(
    sourceText: string,
    userId: string,
    supabase: SupabaseClient<Database>
  ): Promise<number> {
    const sourceTextHash = this.generateHash(sourceText);

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
        model: "openai/gpt-4o-mini",
        generation_duration: 0,
        generated_count: 0,
      })
      .select()
      .single();

    if (insertError || !generation) {
      throw new Error(`Error while saving generation metadata: ${insertError?.message}`);
    }

    return generation.id;
  }

  static async updateGenerationMetadata(
    generationId: number,
    duration: number,
    count: number,
    supabase: SupabaseClient<Database>
  ): Promise<void> {
    const { error } = await supabase
      .from("generations")
      .update({
        generation_duration: duration,
        generated_count: count,
      })
      .eq("id", generationId);

    if (error) {
      throw new Error(`Error while updating generation metadata: ${error.message}`);
    }
  }

  static async generateFlashcards(
    sourceText: string,
    userId: string,
    supabase: SupabaseClient<Database>
  ): Promise<GenerationCreateResponseDTO> {
    this.initializeOpenRouter();
    if (!this.openRouterService) {
      throw new Error("OpenRouter service not initialized. Please check your API key and endpoint configuration.");
    }

    const startTime = Date.now();
    const generationId = await this.createGeneration(sourceText, userId, supabase);

    try {
      const prompt = `
Please analyze the following text and create flashcards from it. For each important concept, create a question-answer pair.
Format your response as a JSON array of flashcard objects, where each object has:
- "front": The question or concept (max 200 characters)
- "back": The answer or explanation (max 500 characters)
- "source": Always set to "ai-full"

Text to analyze:
${sourceText}
`;

      const response = await this.openRouterService.sendMessage(prompt, {});

      const generationDuration = Date.now() - startTime;
      const parsedResponse = JSON.parse(response.answer);

      if (!Array.isArray(parsedResponse.flashcards)) {
        throw new Error("Invalid response format from AI: flashcards array not found");
      }

      await this.updateGenerationMetadata(generationId, generationDuration, parsedResponse.flashcards.length, supabase);

      return {
        generation_id: generationId,
        generated_count: parsedResponse.flashcards.length,
        flashcards: parsedResponse.flashcards,
      };
    } catch (error) {
      //console.error("Error generating flashcards:", error);
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
