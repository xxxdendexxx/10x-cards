/*
 * DTO and Command Model Definitions
 *
 * These types are used to define the shape of the data exchanged with the API.
 * They are directly derived or adapted from the underlying database models (from src/db/database.types.ts) to ensure consistency.
 */

import type { Database } from "./db/database.types";

// Underlying entity types from the database
type FlashcardEntity = Database["public"]["Tables"]["flashcards"]["Row"];
type GenerationLogEntity = Database["public"]["Tables"]["generations"]["Row"];
type GenerationErrorLogEntity = Database["public"]["Tables"]["generation_error_logs"]["Row"];

/* DTOs */
//
// Flashcard DTO
// Represents a flashcard as returned by the API endpoints (GET /flashcards, GET /flashcards/{id})
//
export type FlashcardDTO = Pick<
  FlashcardEntity,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

// Paginated response for listing flashcards
export interface FlashcardsListResponseDTO {
  data: FlashcardDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
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

export interface CreateFlashcardDto {
  front: string; // max 200 characters
  back: string; // max 500 characters
  source: FlashcardSource;
  generationId_id: number | null;
}

// Command for creating a new flashcard

export interface CreateFlashcardCommand {
  flashcards: CreateFlashcardDto[];
}

//
// Flashcard Update DTO (Command Model)
// For the PUT /flashcards/{id} endpoint to update existing flashcards.
// This model is a partial update of flashcard fields.
//
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
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
export interface ConfirmFlashcardsResponseDTO {
  generation_id: number;
  generatedCount: number;
  flashcards: FlashcardDTO[];
}

// For study sessions, we only need minimal flashcard data
export type StudyFlashcardDTO = Pick<FlashcardDTO, "id" | "front">;

export interface StudySessionDTO {
  session: StudyFlashcardDTO[];
}

// UserDTO for account information
export interface UserDTO {
  id: string;
  email: string;
  created_at: string;
}

// GenerationLogDTO reflecting the generations table
export type GenerationLogDTO = GenerationLogEntity;

// GenerationErrorLogDTO reflecting the generation_error_logs table
export type GenerationErrorLogDTO = GenerationErrorLogEntity;

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

// Command to submit a flashcard rating for a study session
export interface SubmitFlashcardRatingCommand {
  rating: number; // e.g., rating between 1 and 5
}

// Command to update user account details
export interface UpdateUserCommand {
  email: string;
  password: string;
}
