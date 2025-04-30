// Import necessary modules
import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateFlashcardCommand, FlashcardUpdateDto } from "../../types";
import { createFlashcards } from "../../lib/services/flashcards";
import { listFlashcardsQuerySchema } from "../../lib/schemas/flashcards.schema";
import { FlashcardsService } from "../../lib/services/flashcardsService";

// Define flashcard schema with validation rules
const flashcardSchema = z
  .object({
    front: z.string().max(200),
    back: z.string().max(500),
    source: z.enum(["ai-full", "ai-edited", "manual"]),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // For manual flashcards, generation_id must be null; otherwise, it must be a number
      if (data.source === "manual") {
        return data.generation_id === null;
      }
      return data.generation_id !== null;
    },
    {
      message: "For 'ai-full' and 'ai-edited', generation_id must be a number, and for 'manual' must be null",
      path: ["generation_id"],
    }
  );

// Define the overall request schema
const createFlashcardCommandSchema = z.object({
  flashcards: z.array(flashcardSchema),
});

// Validation schema for UUID
const idSchema = z.string().uuid("ID must be a valid UUID");

// Validation schema for flashcard update
const flashcardUpdateSchema = z
  .object({
    front: z.string().max(200, "Front text must be 200 characters or less").optional(),
    back: z.string().max(500, "Back text must be 500 characters or less").optional(),
    source: z.enum(["ai-full", "ai-edited", "manual"] as const).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (front, back, or source) must be provided for update",
  });

// POST endpoint for creating flashcards
export const POST: APIRoute = async (context) => {
  // Check if user is authenticated
  if (!context.locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Step 2: Parse and validate request body
    const body = await context.request.json();
    let parsedData: CreateFlashcardCommand;
    try {
      parsedData = createFlashcardCommandSchema.parse(body);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: "Invalid request data", details: errMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Process creation of flashcards, passing the context
    const createdFlashcards = await createFlashcards(parsedData, context);

    // Respond with the created flashcards
    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Global error handling
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    // Check authentication
    if (!context.locals.user) {
      console.warn("Unauthorized access attempt to /api/flashcards");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryResult = listFlashcardsQuerySchema.safeParse(Object.fromEntries(url.searchParams));

    if (!queryResult.success) {
      console.warn("Invalid query parameters for /api/flashcards:", {
        userId: context.locals.user.id,
        errors: queryResult.error.errors,
        params: Object.fromEntries(url.searchParams),
      });
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: queryResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize service with context and fetch flashcards
    const flashcardsService = new FlashcardsService(context);
    const response = await flashcardsService.listFlashcards(queryResult.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in GET /api/flashcards:", {
      userId: context.locals.user?.id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch flashcards. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// PUT endpoint handler for updating a flashcard
export const PUT: APIRoute = async (context) => {
  // Check authentication
  if (!context.locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract id from request URL
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split("/");
  const idFromPath = pathParts[pathParts.length - 1];

  // Validate ID parameter
  let flashcardId: string;
  try {
    flashcardId = idSchema.parse(idFromPath);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse and validate request body
  let updateData: FlashcardUpdateDto;
  try {
    const body = await context.request.json();
    updateData = flashcardUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Call service to update flashcard
  try {
    const flashcardsService = new FlashcardsService(context);
    const updatedFlashcard = await flashcardsService.updateFlashcard(flashcardId, updateData);

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error updating flashcard:", error);
      return new Response(JSON.stringify({ error: "Server error occurred" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
