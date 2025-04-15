import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Import the view model interface
interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  source: "ai-full" | "ai-edited";
}

interface EditFlashcardModalProps {
  proposal: FlashcardProposalViewModel | null;
  isOpen: boolean;
  onSave: (updatedProposal: FlashcardProposalViewModel) => void;
  onClose: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

const EditFlashcardModal: React.FC<EditFlashcardModalProps> = ({ proposal, isOpen, onSave, onClose }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);

  // Initialize form when proposal changes
  useEffect(() => {
    if (proposal) {
      setFront(proposal.front);
      setBack(proposal.back);
    }
  }, [proposal]);

  // Validate front content
  useEffect(() => {
    if (front.length > MAX_FRONT_LENGTH) {
      setFrontError(`Front text must not exceed ${MAX_FRONT_LENGTH} characters (currently ${front.length})`);
    } else {
      setFrontError(null);
    }
  }, [front]);

  // Validate back content
  useEffect(() => {
    if (back.length > MAX_BACK_LENGTH) {
      setBackError(`Back text must not exceed ${MAX_BACK_LENGTH} characters (currently ${back.length})`);
    } else {
      setBackError(null);
    }
  }, [back]);

  const handleSave = () => {
    if (!proposal || frontError || backError) return;

    const updatedProposal: FlashcardProposalViewModel = {
      ...proposal,
      front,
      back,
    };

    onSave(updatedProposal);
  };

  // Don't render if no proposal is selected
  if (!proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front" className="flex justify-between">
              <span>
                Front <span className="text-gray-500">(max {MAX_FRONT_LENGTH} characters)</span>
              </span>
              <span className={front.length > MAX_FRONT_LENGTH ? "text-red-500" : "text-gray-500"}>
                {front.length}/{MAX_FRONT_LENGTH}
              </span>
            </Label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className={frontError ? "border-red-500" : ""}
            />
            {frontError && <p className="text-sm text-red-500">{frontError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="back" className="flex justify-between">
              <span>
                Back <span className="text-gray-500">(max {MAX_BACK_LENGTH} characters)</span>
              </span>
              <span className={back.length > MAX_BACK_LENGTH ? "text-red-500" : "text-gray-500"}>
                {back.length}/{MAX_BACK_LENGTH}
              </span>
            </Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={`min-h-[150px] ${backError ? "border-red-500" : ""}`}
            />
            {backError && <p className="text-sm text-red-500">{backError}</p>}
          </div>

          {(proposal.originalFront !== front || proposal.originalBack !== back) && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-800">
              <p>This flashcard has been edited from its original AI-generated content.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!front.trim() || !back.trim() || !!frontError || !!backError}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardModal;
