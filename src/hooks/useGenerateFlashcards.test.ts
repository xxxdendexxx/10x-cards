import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FlashcardProposalViewModel } from "./useGenerateFlashcards";
import useGenerateFlashcards from "./useGenerateFlashcards";
import { toast } from "sonner";

// Mocking dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Define counter outside describe block
let uuidCounter = 0;

// Helper to create a mock fetch response
const createMockFetchResponse = (body: unknown, ok = true, status = 200, statusText = "OK") => {
  return Promise.resolve({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as Response);
};

describe("useGenerateFlashcards", () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset counter for each test
    uuidCounter = 0;

    // Mock crypto.randomUUID *inside* beforeEach to ensure it's fresh for each test
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn().mockImplementation(() => {
        uuidCounter++;
        return `test-uuid-${uuidCounter}`;
      }),
    });

    // Mock fetch API
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test initialization
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    expect(result.current.sourceText).toBe("");
    expect(result.current.proposals).toEqual([]);
    expect(result.current.isLoadingGenerate).toBe(false);
    expect(result.current.isLoadingSave).toBe(false);
    expect(result.current.errorGenerate).toBeNull();
    expect(result.current.errorSave).toBeNull();
    expect(result.current.editingProposal).toBeNull();
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  // Test source text change handler
  it("should update source text when handleSourceTextChange is called", () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    act(() => {
      result.current.handleSourceTextChange("New source text");
    });

    expect(result.current.sourceText).toBe("New source text");
  });

  // Test generating flashcards successfully
  it("should handle generating flashcards successfully", async () => {
    // Mock successful fetch response
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 2,
      flashcards: [
        { front: "Front 1", back: "Back 1" },
        { front: "Front 2", back: "Back 2" },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));

    const { result } = renderHook(() => useGenerateFlashcards());

    await act(async () => {
      await result.current.handleGenerateSubmit("Some source text with sufficient length");
    });

    // Verify state after successful generation using waitFor
    await waitFor(() => {
      expect(result.current.proposals.length).toBe(2);
      // Explicitly check if the mock was called
      expect(crypto.randomUUID).toHaveBeenCalled();
      // Assert id separately first
      expect(result.current.proposals[0].id).toEqual("test-uuid-1");
      // Then check the rest of the object
      expect(result.current.proposals[0]).toEqual(
        expect.objectContaining({
          front: "Front 1",
          back: "Back 1",
          status: "pending",
          source: "ai-full",
        })
      );
      // Optionally check the second proposal too
      expect(result.current.proposals[1].id).toEqual("test-uuid-2");
      expect(result.current.proposals[1]).toEqual(
        expect.objectContaining({
          front: "Front 2",
          back: "Back 2",
          status: "pending",
          source: "ai-full",
        })
      );
    });

    // State checks outside waitFor if they don't depend on the async proposal update
    expect(result.current.isLoadingGenerate).toBe(false);

    // Check if toast was displayed
    expect(toast.success).toHaveBeenCalledWith("Generated 2 flashcard proposals", expect.any(Object));

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/generate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText: "Some source text with sufficient length" }),
      })
    );
    // Check generationId was set
    // NOTE: generationId is internal, but we can infer it was set by checking if save works later
  });

  // Test error handling during generation
  it("should handle errors when generating flashcards fails", async () => {
    // Mock failed fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockFetchResponse({}, false, 500, "Server Error")
    );

    const { result } = renderHook(() => useGenerateFlashcards());

    await act(async () => {
      await result.current.handleGenerateSubmit("Some source text");
    });

    // Verify error state
    expect(result.current.isLoadingGenerate).toBe(false);
    expect(result.current.errorGenerate).toBeInstanceOf(Error);
    expect(result.current.errorGenerate?.message).toContain("API error: 500 Server Error");
    expect(result.current.proposals).toEqual([]);
  });

  // Test network error during generation
  it("should handle network errors during generation", async () => {
    // Mock network error
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error")); // Use new Error here directly

    const { result } = renderHook(() => useGenerateFlashcards());

    // Use try/catch within act to handle expected rejection, although the hook catches it internally
    await act(async () => {
      try {
        await result.current.handleGenerateSubmit("Some source text");
      } catch {
        // We expect the hook to catch this, so this catch might not even run
        // if the hook's catch works properly.
        // Error variable is intentionally omitted as it's not used.
      }
    });

    // Verify error state *after* the hook state has potentially updated
    await waitFor(() => {
      expect(result.current.isLoadingGenerate).toBe(false);
      expect(result.current.errorGenerate).toBeInstanceOf(Error);
      expect(result.current.errorGenerate?.message).toBe("Network error");
    });
  });

  // Test accepting a flashcard proposal
  it("should update proposal status when accepted", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate proposals first
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    const proposalId = result.current.proposals[0].id;

    // Now accept the proposal
    act(() => {
      result.current.handleAccept(proposalId);
    });

    // Verify proposal status updated
    expect(result.current.proposals[0].status).toBe("accepted");
    expect(result.current.canSave).toBe(true);
  });

  // Test rejecting a flashcard proposal
  it("should update proposal status when rejected", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate proposals first
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    const proposalId = result.current.proposals[0].id;

    // Now reject the proposal
    act(() => {
      result.current.handleReject(proposalId);
    });

    // Verify proposal status updated
    expect(result.current.proposals[0].status).toBe("rejected");
    expect(result.current.canSave).toBe(false);
  });

  // Test editing a flashcard proposal
  it("should open modal with correct data when editing a proposal", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate proposals first
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    const proposalToEdit = result.current.proposals[0];

    // Now click edit
    act(() => {
      result.current.handleEditClick(proposalToEdit);
    });

    // Verify modal state
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingProposal).toEqual(proposalToEdit);
  });

  // Test saving edited proposal
  it("should update proposal when edited and saved", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate proposals first
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    const originalProposal = result.current.proposals[0];

    // Prepare updated proposal - ensure type correctness
    const updatedProposalData: FlashcardProposalViewModel = {
      ...originalProposal, // Spread original data
      front: "Edited Front",
      back: "Edited Back",
      // Status and source will be set by the handler
    };

    // Save edited proposal using the handler
    act(() => {
      result.current.handleModalSave(updatedProposalData);
    });

    // Verify state updates
    expect(result.current.proposals[0].front).toBe("Edited Front");
    expect(result.current.proposals[0].back).toBe("Edited Back");
    expect(result.current.proposals[0].status).toBe("edited");
    expect(result.current.proposals[0].source).toBe("ai-edited");
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.editingProposal).toBeNull();
    expect(result.current.canSave).toBe(true);
  });

  // Test closing modal without saving
  it("should close modal without saving changes", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate proposals and open modal
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });
    const proposalToEdit = result.current.proposals[0];
    act(() => {
      result.current.handleEditClick(proposalToEdit);
    });

    // Ensure modal is open
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingProposal).toEqual(proposalToEdit);

    // Close modal using the handler
    act(() => {
      result.current.handleModalClose();
    });

    // Verify modal closed without changes
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.editingProposal).toBeNull();
  });

  // Test saving approved flashcards successfully
  it("should save approved flashcards successfully", async () => {
    // Mock GENERATE response
    const mockGenerateResponse = {
      generation_id: 123,
      generated_count: 3,
      flashcards: [
        { front: "Front 1", back: "Back 1" },
        { front: "Front 2", back: "Back 2" },
        { front: "Front 3", back: "Back 3" },
      ],
    };
    // Mock SAVE response
    const mockSaveResponse = { saved: 2 };

    // Setup mocks for both calls IN ORDER
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(createMockFetchResponse(mockGenerateResponse)) // First call: Generate
      .mockResolvedValueOnce(createMockFetchResponse(mockSaveResponse)); // Second call: Save

    const { result } = renderHook(() => useGenerateFlashcards());

    // 1. Generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    // Ensure generationId was likely set (needed for saving)
    // We can check this indirectly by seeing if the save call uses it.

    // 2. Accept/Reject/Edit proposals
    // Get initial proposals after generation
    const initialProposals = result.current.proposals;
    expect(initialProposals.length).toBe(3); // Sanity check

    act(() => {
      result.current.handleAccept(initialProposals[0].id);
    }); // Accept 1 (id: test-uuid-1)
    act(() => {
      result.current.handleReject(initialProposals[1].id);
    }); // Reject 1 (id: test-uuid-2)
    act(() => {
      result.current.handleEditClick(initialProposals[2]);
    }); // Start editing 1 (id: test-uuid-3)

    // IMPORTANT: Ensure we get the proposal *from the current state* before editing
    act(() => {
      // Find the proposal currently being edited from the *latest* state
      const proposalToSave = result.current.proposals.find((p) => p.id === initialProposals[2].id);
      if (!proposalToSave) throw new Error("Proposal to save not found");

      const editedProposal: FlashcardProposalViewModel = {
        ...proposalToSave, // Use the latest state
        front: "Edited Front 3",
        back: "Edited Back 3",
      };
      result.current.handleModalSave(editedProposal); // Save edited 1
    });

    // 3. Save approved flashcards
    await act(async () => {
      await result.current.handleSaveApproved();
    });

    // Verify fetch call for SAVE was the *second* call
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Verify the SECOND fetch call was for SAVE with the correct payload
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/flashcards",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Correct expected structure based on hook implementation
          flashcards: [
            {
              // Accepted card
              front: "Front 1",
              back: "Back 1",
              source: "ai-full",
              generation_id: 123,
            },
            {
              // Edited card
              front: "Edited Front 3",
              back: "Edited Back 3",
              source: "ai-edited",
              generation_id: 123,
            },
          ],
        }),
      })
    );

    // Verify state reset after successful save
    expect(result.current.proposals).toEqual([]);
    expect(result.current.sourceText).toBe("");
    expect(result.current.isLoadingSave).toBe(false);
    expect(result.current.errorSave).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("Flashcards saved successfully", expect.any(Object));
  });

  // Test error handling when saving flashcards
  it("should handle errors when saving flashcards fails", async () => {
    // Mock GENERATE response
    const mockGenerateResponse = {
      generation_id: 123,
      generated_count: 1,
      flashcards: [{ front: "Front 1", back: "Back 1" }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(createMockFetchResponse(mockGenerateResponse));

    // Mock failed SAVE response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      createMockFetchResponse({}, false, 500, "Server Error")
    );

    const { result } = renderHook(() => useGenerateFlashcards());

    // Generate and accept a proposal
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });
    act(() => {
      result.current.handleAccept(result.current.proposals[0].id);
    });

    // Try to save with error
    await act(async () => {
      await result.current.handleSaveApproved();
    });

    // Verify error state
    expect(result.current.isLoadingSave).toBe(false);
    expect(result.current.errorSave).toBeInstanceOf(Error);
    expect(result.current.errorSave?.message).toContain("API error: 500 Server Error");

    // Verify proposals not cleared on error
    expect(result.current.proposals.length).toBe(1);
    // Check toast error was NOT displayed by hook (container displays it)
    expect(toast.error).not.toHaveBeenCalled();
  });

  // Test save without generation ID (should not happen if generate is called first)
  // This test implicitly checks the internal guard
  it("should show error if trying to save without generation having happened", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Try to save immediately (no generationId set)
    await act(async () => {
      await result.current.handleSaveApproved();
    });

    // Verify error state
    expect(result.current.errorSave).toBeInstanceOf(Error);
    expect(result.current.errorSave?.message).toBe("No generation ID available");

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoadingSave).toBe(false);
  });

  // Test canSave derived state
  it("should correctly calculate canSave based on proposal statuses", async () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Initially no proposals
    expect(result.current.canSave).toBe(false);

    // Generate proposals
    const mockApiResponse = {
      generation_id: 123,
      generated_count: 2,
      flashcards: [
        { front: "F1", back: "B1" },
        { front: "F2", back: "B2" },
      ],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(createMockFetchResponse(mockApiResponse));
    await act(async () => {
      await result.current.handleGenerateSubmit("text");
    });

    const proposals = result.current.proposals;

    // Still pending, cannot save
    expect(result.current.canSave).toBe(false);

    // Reject first proposal
    act(() => {
      result.current.handleReject(proposals[0].id);
    });
    expect(result.current.canSave).toBe(false);

    // Accept second proposal
    act(() => {
      result.current.handleAccept(proposals[1].id);
    });
    expect(result.current.canSave).toBe(true); // Can save now

    // Reject second proposal again
    act(() => {
      result.current.handleReject(proposals[1].id);
    });
    expect(result.current.canSave).toBe(false); // Cannot save again

    // Edit first proposal
    act(() => {
      result.current.handleEditClick(proposals[0]);
    });
    act(() => {
      const edited = { ...proposals[0], front: "Edited" };
      result.current.handleModalSave(edited);
    });
    expect(result.current.canSave).toBe(true); // Can save with edited
  });
});
