import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { GenerationService } from "./generation.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

// Define the mock send message function globally for reuse
const mockSendMessage = vi.fn();

describe("GenerationService", () => {
  let service: GenerationService;
  let mockContext: APIContext;
  let mockSupabase: SupabaseClient<Database>;
  let initializeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset the static property directly - necessary due to static nature
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (GenerationService as any).openRouterService = null;

    // Reset mocks before each test
    vi.clearAllMocks();
    mockSendMessage.mockClear();

    // Default mock response for sendMessage for most tests
    mockSendMessage.mockResolvedValue({
      answer: JSON.stringify({
        flashcards: [
          { front: "Test Question 1", back: "Test Answer 1", source: "ai-full" },
          { front: "Test Question 2", back: "Test Answer 2", source: "ai-full" },
        ],
      }),
      metadata: {},
    });

    // Create a mock instance object that conforms to what GenerationService needs
    const mockOpenRouterInstance = {
      sendMessage: mockSendMessage,
      // Add other methods/properties if GenerationService uses them
    };

    // Spy on the static initializeOpenRouter method *before* creating the service instance
    // Use type assertion for spying on private static method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializeSpy = vi.spyOn(GenerationService as any, "initializeOpenRouter");
    // Override its implementation to directly set the static property to our mock instance
    initializeSpy.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (GenerationService as any).openRouterService = mockOpenRouterInstance;
    });

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient<Database>;

    // Mock API context
    mockContext = {
      locals: {
        supabase: mockSupabase,
        user: { id: "test-user-id" },
      },
    } as unknown as APIContext;

    // Configure default mock responses for Supabase
    const mockFrom = mockSupabase.from as Mock;
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 123 },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    // Create service instance - this now calls our *mocked* initializeOpenRouter
    service = new GenerationService(mockContext);
  });

  afterEach(() => {
    // Ensure mocks and spies are reset after each test
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should throw error when supabase client is not available", () => {
      const invalidContext = { locals: {} } as unknown as APIContext;
      // Using any to bypass private modifier for testing static property reset.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (GenerationService as any).openRouterService = null;
      // Need to call spyOn again as vi.restoreAllMocks clears it
      // Provide a minimal mock implementation for the spy in this specific test
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(GenerationService as any, "initializeOpenRouter").mockImplementation(() => {
        /* Do nothing specific for this error test */
      });
      expect(() => new GenerationService(invalidContext)).toThrow("Supabase client not found in context.locals");
      spy.mockRestore(); // Clean up spy specific to this test
    });

    it("should throw error when user is not available", () => {
      const invalidContext = {
        locals: { supabase: {} as SupabaseClient<Database> },
      } as unknown as APIContext;
      // Using any to bypass private modifier for testing static property reset.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (GenerationService as any).openRouterService = null;
      // Provide a minimal mock implementation for the spy in this specific test
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(GenerationService as any, "initializeOpenRouter").mockImplementation(() => {
        /* Do nothing specific for this error test */
      });
      expect(() => new GenerationService(invalidContext)).toThrow("User not found in context.locals");
      spy.mockRestore(); // Clean up spy specific to this test
    });

    it("should call the mocked initializeOpenRouter during initialization", () => {
      // Service is instantiated in beforeEach, which calls our spied/mocked method
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe("createGeneration", () => {
    it("should create a generation record in the database", async () => {
      const sourceText = "Test source text";
      const generationId = await service.createGeneration(sourceText);
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
      expect(generationId).toBe(123);
    });

    it("should throw error when insert fails", async () => {
      const mockFrom = mockSupabase.from as Mock;
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" },
            }),
          }),
        }),
      });
      await expect(service.createGeneration("Test text")).rejects.toThrow(
        "Error while saving generation metadata: Insert failed"
      );
    });
  });

  describe("updateGenerationMetadata", () => {
    it("should update the generation metadata", async () => {
      await service.updateGenerationMetadata(123, 1000, 5);
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
      // Pass table name to the mock
      expect((mockSupabase.from as Mock)("generations").update).toHaveBeenCalledWith({
        generation_duration: 1000,
        generated_count: 5,
      });
    });

    it("should throw error when update fails", async () => {
      const mockFrom = mockSupabase.from as Mock;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: "Update failed" },
          }),
        }),
      });
      await expect(service.updateGenerationMetadata(123, 1000, 5)).rejects.toThrow(
        "Error while updating generation metadata: Update failed"
      );
    });
  });

  describe("generateFlashcards", () => {
    it("should generate flashcards from source text using default mock", async () => {
      // Spy on internal methods of the *instance*
      const createGenerationSpy = vi.spyOn(service, "createGeneration").mockResolvedValue(123);
      const updateGenerationMetadataSpy = vi.spyOn(service, "updateGenerationMetadata").mockResolvedValue(undefined);

      const sourceText = "Test source text";
      const result = await service.generateFlashcards(sourceText);

      // Check if the mocked sendMessage (assigned via the initializeSpy) was called
      expect(mockSendMessage).toHaveBeenCalled();
      expect(createGenerationSpy).toHaveBeenCalledWith(sourceText);
      expect(updateGenerationMetadataSpy).toHaveBeenCalledWith(123, expect.any(Number), 2); // Default mock returns 2 flashcards
      expect(result).toEqual({
        generation_id: 123,
        generated_count: 2,
        flashcards: [
          { front: "Test Question 1", back: "Test Answer 1", source: "ai-full" },
          { front: "Test Question 2", back: "Test Answer 2", source: "ai-full" },
        ],
      });
    });

    it("should throw the specific error when the mocked sendMessage implementation throws", async () => {
      // Simulate failure by making the mock implementation throw for this test
      mockSendMessage.mockImplementationOnce(() => {
        // Note: We throw the exact error message expected by the test
        throw new Error("Simulated service interaction failure");
      });

      // Now the error caught *should* be exactly the one we threw
      await expect(service.generateFlashcards("Test text")).rejects.toThrow(
        "Failed to generate flashcards: Simulated service interaction failure"
      );

      // Ensure the mock was called even though it threw an error
      expect(mockSendMessage).toHaveBeenCalled();
    });

    it("should throw error when AI response parsing fails (invalid format)", async () => {
      // Override the mock response for sendMessage for this specific test
      mockSendMessage.mockResolvedValueOnce({
        answer: JSON.stringify({ invalidFormat: true }), // Invalid structure
        metadata: {},
      });

      // The internal JSON parsing should fail
      await expect(service.generateFlashcards("Test text")).rejects.toThrow(
        "Invalid response format from AI: flashcards array not found"
      );
      // Ensure the mock was called even though the subsequent parsing failed
      expect(mockSendMessage).toHaveBeenCalled();
    });

    it("should throw error when AI request promise rejects", async () => {
      // Override the mock for sendMessage to reject for this specific test
      mockSendMessage.mockRejectedValueOnce(new Error("API rate limit exceeded"));

      // The catch block in generateFlashcards should handle this rejection
      await expect(service.generateFlashcards("Test text")).rejects.toThrow(
        "Failed to generate flashcards: API rate limit exceeded"
      );
      // Ensure the mock was called even though it rejected
      expect(mockSendMessage).toHaveBeenCalled();
    });

    it("should throw error if static openRouterService is null when generateFlashcards is called", async () => {
      // Directly set the static property to null AFTER initial setup in beforeEach
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (GenerationService as any).openRouterService = null;

      // Expect the specific error message for null service
      await expect(service.generateFlashcards("Test text for null service")).rejects.toThrow(
        "OpenRouter service not initialized. Please check your API key and endpoint configuration."
      );
    });
  });
});
