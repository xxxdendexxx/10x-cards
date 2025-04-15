import useGenerateFlashcards from "../hooks/useGenerateFlashcards";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";
import FlashcardProposalList from "./FlashcardProposalList";
import SaveApprovedButton from "./SaveApprovedButton";
import EditFlashcardModal from "./EditFlashcardModal";
import { toast } from "sonner";

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

  // Display errors using toast
  if (errorGenerate) {
    toast.error("Failed to generate flashcards. Please try again.");
  }

  if (errorSave) {
    toast.error("Failed to save flashcards. Please try again.");
  }

  return (
    <div className="flex flex-col gap-6">
      <GenerateFlashcardsForm
        onSubmit={handleGenerateSubmit}
        isLoading={isLoadingGenerate}
        initialSourceText={sourceText}
      />

      {proposals.length > 0 && (
        <>
          <FlashcardProposalList
            proposals={proposals}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEditClick}
          />

          <SaveApprovedButton onClick={handleSaveApproved} isEnabled={canSave} isLoading={isLoadingSave} />
        </>
      )}

      <EditFlashcardModal
        proposal={editingProposal}
        isOpen={isModalOpen}
        onSave={handleModalSave}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default GenerateFlashcardsContainer;
