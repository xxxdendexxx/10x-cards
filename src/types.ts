/*
 * DTO and Command Model Definitions
 *
 * These types are used to define the shape of the data exchanged with the API.
 * They are directly derived or adapted from the underlying database models (from src/db/database.types.ts) to ensure consistency.
 */

import type { Database } from "./db/database.types";

// Underlying entity types from the database
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];
/* DTOs */
//
// Flashcard DTO
// Represents a flashcard as returned by the API endpoints (GET /flashcards, GET /flashcards/{id})
//
export type FlashcardDTO = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

///
// Pagination DTO
// Contains pagination details used in list responses
//
export interface PaginationDTO {
  page: number;
  pageSize: number;
  total: number;
}

// Paginated response for listing flashcards
export interface FlashcardsListResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

// Flashcard Create DTO & Command Model
// Used in the POST /flashcards endpoint to create one or more flashcards.
// Validation rules:
// - front: maximum length 200 characters
// - back: maximum length 500 characters
// - source: must be one of "ai-full", "ai-edited", or "manual"
// - generation_id: required for "ai-full" and "ai-edited", must be null for "manual"
//
export type FlashcardSource = "ai-full" | "ai-edited" | "manual";

export interface FlashcardCreateDTO {
  front: string; // max 200 characters
  back: string; // max 500 characters
  source: FlashcardSource;
  generation_id: number | null;
}

// Command for creating a new flashcard

export interface CreateFlashcardCommand {
  flashcards: FlashcardCreateDTO[];
}

//
// Flashcard Update DTO (Command Model)
// For the PUT /flashcards/{id} endpoint to update existing flashcards.
// This model is a partial update of flashcard fields.
//
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number | null;
}>;

// Command to generate flashcard proposals from input text
export interface GenerateFlashcardProposalsCommand {
  sourceText: string; // Input text for AI generation (length between 1000 and 10000 characters)
}

// FlashcardProposalDTO is used to represent AI-generated flashcard proposals
export interface FlashcardProposalDTO {
  front: string;
  back: string;
  // The source for proposals is always 'ai-full'
  source: "ai-full";
}

// Response DTO for confirming AI-generated flashcards
export interface GenerationCreateResponseDTO {
  generation_id: number;
  generated_count: number;
  flashcards: FlashcardProposalDTO[];
}

//
// Generation Detail DTO
// Provides detailed information for a generation request (GET /generations/{id}),
// including metadata from the generations table and optionally, the associated flashcards.
//
export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDTO[];
};

//
// Generation Error Log DTO
// Represents an error log entry for the AI flashcard generation process (GET /generation-error-logs).
//
export type GenerationErrorLogDTO = Pick<
  GenerationErrorLog,
  | "id"
  | "error_message"
  | "model"
  | "source_text_hash"
  | "source_text_length"
  | "created_at"
  | "user_id"
  | "error_details"
>;

/* Command Models */

// Command for updating an existing flashcard; allows partial update
export type UpdateFlashcardCommand = Partial<CreateFlashcardCommand>;

// Command to confirm and persist AI-generated flashcards after review
export interface ConfirmFlashcardsCommand {
  flashcards: {
    front: string;
    back: string;
    // After review, proposals are edited and marked as 'ai-edited'
    source: "ai-edited";
  }[];
  sourceTextHash: string;
  sourceTextLength: number;
  model: string;
  generationDuration: number;
}
