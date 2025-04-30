import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardProposalsCommand } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";

// Schema for validating the request body
const generateFlashcardProposalsSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

export const POST: APIRoute = async (context) => {
  // Check if user is authenticated
  if (!context.locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Parse and validate input data
    const body = (await context.request.json()) as GenerateFlashcardProposalsCommand;
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

    // 2. Instantiate GenerationService and generate flashcards
    const generationService = new GenerationService(context); // Pass the whole context
    const response = await generationService.generateFlashcards(sourceText);

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
