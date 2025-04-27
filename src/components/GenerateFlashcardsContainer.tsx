import { useEffect } from "react";
import useGenerateFlashcards from "../hooks/useGenerateFlashcards";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";
import FlashcardProposalList from "./FlashcardProposalList";
import SaveApprovedButton from "./SaveApprovedButton";
import EditFlashcardModal from "./EditFlashcardModal";
import { toast, Toaster } from "sonner";

const GenerateFlashcardsContainer: React.FC = () => {
  const {
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
  } = useGenerateFlashcards();

  // Display errors using toast when they change
  useEffect(() => {
    if (errorGenerate) {
      toast.error("Failed to generate flashcards", {
        description: "There was an error when trying to generate flashcards. Please try again.",
        duration: 5000,
      });
    }
  }, [errorGenerate]);

  useEffect(() => {
    if (errorSave) {
      toast.error("Failed to save flashcards", {
        description: "There was an error when saving your flashcards. Please try again.",
        duration: 5000,
      });
    }
  }, [errorSave]);

  return (
    <div className="flex flex-col gap-6" data-testid="generate-flashcards-container">
      <GenerateFlashcardsForm
        onSubmit={handleGenerateSubmit}
        isLoading={isLoadingGenerate}
        initialSourceText={sourceText}
        onTextChange={handleSourceTextChange}
        data-testid="generate-flashcards-form"
      />

      {proposals.length > 0 && (
        <>
          <FlashcardProposalList
            proposals={proposals}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEditClick}
            data-testid="flashcard-proposal-list"
          />

          <SaveApprovedButton
            onClick={handleSaveApproved}
            isEnabled={canSave}
            isLoading={isLoadingSave}
            data-testid="save-approved-button"
          />
        </>
      )}

      <EditFlashcardModal
        proposal={editingProposal}
        isOpen={isModalOpen}
        onSave={handleModalSave}
        onClose={handleModalClose}
        data-testid="edit-flashcard-modal"
      />

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default GenerateFlashcardsContainer;
