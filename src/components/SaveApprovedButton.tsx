import { Button } from "@/components/ui/button";

interface SaveApprovedButtonProps {
  onClick: () => void;
  isEnabled: boolean;
  isLoading: boolean;
}

const SaveApprovedButton = ({ onClick, isEnabled, isLoading }: SaveApprovedButtonProps) => {
  return (
    <div className="flex flex-col items-center py-4 border-t border-gray-200 mt-4">
      <Button onClick={onClick} disabled={!isEnabled || isLoading} size="lg" className="w-full sm:w-auto">
        {isLoading ? "Saving..." : "Save Approved Flashcards"}
      </Button>

      <p className="text-sm text-gray-500 mt-2">
        {!isEnabled
          ? "You need to accept or edit at least one flashcard to save."
          : "Only accepted and edited flashcards will be saved to your collection."}
      </p>
    </div>
  );
};

export default SaveApprovedButton;
