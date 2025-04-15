import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  GenerationCreateResponseDTO,
  GenerateFlashcardProposalsCommand,
  FlashcardCreateDTO,
  CreateFlashcardCommand,
} from "../types";

// ViewModel for UI representation of flashcard proposals
export interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  source: "ai-full" | "ai-edited";
}

const useGenerateFlashcards = () => {
  // State management
  const [sourceText, setSourceText] = useState("");
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [errorGenerate, setErrorGenerate] = useState<Error | null>(null);
  const [errorSave, setErrorSave] = useState<Error | null>(null);
  const [editingProposal, setEditingProposal] = useState<FlashcardProposalViewModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Show success toast when flashcards are saved
  useEffect(() => {
    if (saveSuccess) {
      toast.success("Flashcards saved successfully", {
        description: "Your approved flashcards have been saved to your collection.",
      });
      setSaveSuccess(false);
    }
  }, [saveSuccess]);

  // Derived state
  const canSave = proposals.some((p) => p.status === "accepted" || p.status === "edited");

  // Handlers
  const handleSourceTextChange = useCallback((text: string) => {
    setSourceText(text);
  }, []);

  const handleGenerateSubmit = useCallback(async (text: string) => {
    setIsLoadingGenerate(true);
    setErrorGenerate(null);
    setSourceText(text);

    try {
      const payload: GenerateFlashcardProposalsCommand = { sourceText: text };
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: GenerationCreateResponseDTO = await response.json();

      // Map API response to view models
      const proposalViewModels: FlashcardProposalViewModel[] = data.flashcards.map((proposal) => ({
        id: crypto.randomUUID(),
        front: proposal.front,
        back: proposal.back,
        originalFront: proposal.front,
        originalBack: proposal.back,
        status: "pending",
        source: "ai-full",
      }));

      setProposals(proposalViewModels);
      setGenerationId(data.generation_id);

      // Show success notification with count
      toast.success(`Generated ${data.generated_count} flashcard proposals`, {
        description: "Review each proposal and accept, edit, or reject it.",
      });
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setErrorGenerate(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingGenerate(false);
    }
  }, []);

  const handleAccept = useCallback((id: string) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: "accepted" } : p)));
  }, []);

  const handleReject = useCallback((id: string) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
  }, []);

  const handleEditClick = useCallback((proposal: FlashcardProposalViewModel) => {
    setEditingProposal(proposal);
    setIsModalOpen(true);
  }, []);

  const handleModalSave = useCallback((updatedProposal: FlashcardProposalViewModel) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === updatedProposal.id ? { ...updatedProposal, status: "edited", source: "ai-edited" } : p))
    );
    setIsModalOpen(false);
    setEditingProposal(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingProposal(null);
  }, []);

  const handleSaveApproved = useCallback(async () => {
    if (!generationId) {
      setErrorSave(new Error("No generation ID available"));
      return;
    }

    setIsLoadingSave(true);
    setErrorSave(null);

    try {
      // Filter proposals to only include accepted or edited ones
      const approvedProposals = proposals.filter((p) => p.status === "accepted" || p.status === "edited");

      // Map view models to DTOs
      const flashcardsToSave: FlashcardCreateDTO[] = approvedProposals.map((p) => ({
        front: p.front,
        back: p.back,
        source: p.source,
        generation_id: generationId,
      }));

      const payload: CreateFlashcardCommand = { flashcards: flashcardsToSave };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Flashcards saved successfully:", data);

      // Clear the proposals after successful save
      setProposals([]);
      setSourceText("");
      setGenerationId(null);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Error saving flashcards:", err);
      setErrorSave(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingSave(false);
    }
  }, [proposals, generationId]);

  return {
    sourceText,
    proposals,
    isLoadingGenerate,
    isLoadingSave,
    errorGenerate,
    errorSave,
    editingProposal,
    isModalOpen,
    canSave,
    handleSourceTextChange,
    handleGenerateSubmit,
    handleAccept,
    handleReject,
    handleEditClick,
    handleModalSave,
    handleModalClose,
    handleSaveApproved,
  };
};

export default useGenerateFlashcards;
