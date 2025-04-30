import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardsService } from "../flashcardsService";
import type { SupabaseClient } from "../../../db/supabase.client";

describe("FlashcardsService", () => {
  let mockSupabase: SupabaseClient;
  let service: FlashcardsService;

  beforeEach(() => {
    // Create a mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    service = new FlashcardsService(mockSupabase);
  });

  it("should fetch flashcards with default parameters", async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          front: "Test Front",
          back: "Test Back",
          source: "manual",
          generation_id: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      count: 1,
      error: null,
    };

    mockSupabase.from().select().eq().eq().order().range = vi.fn().mockResolvedValue(mockResponse);

    const result = await service.listFlashcards("user123", {
      page: 1,
      pageSize: 10,
      sortBy: "created_at",
    });

    expect(result).toEqual({
      data: mockResponse.data,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
      },
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    expect(mockSupabase.select).toHaveBeenCalledWith("id, front, back, source, generation_id, created_at, updated_at", {
      count: "exact",
    });
  });

  it("should apply filter when provided", async () => {
    const mockResponse = {
      data: [],
      count: 0,
      error: null,
    };

    const mockEq = vi.fn().mockReturnThis();
    mockSupabase.from().select().eq().eq = mockEq;
    mockSupabase.from().select().eq().eq().order().range = vi.fn().mockResolvedValue(mockResponse);

    await service.listFlashcards("user123", {
      page: 1,
      pageSize: 10,
      sortBy: "created_at",
      filter: "ai-full",
    });

    expect(mockEq).toHaveBeenCalledWith("source", "ai-full");
  });

  it("should handle database errors", async () => {
    const mockError = new Error("Database error");
    mockSupabase.from().select().eq().eq().order().range = vi
      .fn()
      .mockResolvedValue({ data: null, count: null, error: mockError });

    await expect(
      service.listFlashcards("user123", {
        page: 1,
        pageSize: 10,
        sortBy: "created_at",
      })
    ).rejects.toThrow("Failed to fetch flashcards: Database error");
  });
});
