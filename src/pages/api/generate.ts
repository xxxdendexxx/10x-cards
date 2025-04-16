import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardProposalsCommand, GenerationCreateResponseDTO } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";

// Schema for validating the request body
const generateFlashcardProposalsSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse and validate input data
    const body = (await request.json()) as GenerateFlashcardProposalsCommand;
    const validationResult = generateFlashcardProposalsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { sourceText } = validationResult.data;

    // 2. Generate flashcards using OpenRouter AI
    const response = await GenerationService.generateFlashcards(sourceText);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
