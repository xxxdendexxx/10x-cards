import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardProposalsCommand, GenerationCreateResponseDTO } from "../../types";
import { GenerationService, MockAIService } from "../../lib/services/generation.service";

// Schema for validating the request body
const generateFlashcardProposalsSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Tekst źródłowy musi mieć co najmniej 1000 znaków")
    .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków"),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parsowanie i walidacja danych wejściowych
    const body = (await request.json()) as GenerateFlashcardProposalsCommand;
    const validationResult = generateFlashcardProposalsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { sourceText } = validationResult.data;
    const startTime = performance.now();

    // 2. Inicjalizacja generacji w bazie danych
    const generation = await GenerationService.createGeneration(sourceText);

    // 3. Generowanie fiszek
    const flashcards = await MockAIService.generateFlashcards(sourceText);
    const generationDuration = Math.round(performance.now() - startTime);

    // 4. Aktualizacja metadanych generacji
    await GenerationService.updateGenerationMetadata(generation.id, generationDuration, flashcards.length);

    const response: GenerationCreateResponseDTO = {
      generation_id: generation.id,
      generated_count: flashcards.length,
      flashcards,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd wewnętrzny serwera",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
