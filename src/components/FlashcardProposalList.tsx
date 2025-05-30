import FlashcardProposalItem from "./FlashcardProposalItem";
import PropTypes from "prop-types";

// Import the view model interface from hook
interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  source: "ai-full" | "ai-edited";
}

interface FlashcardProposalListProps {
  proposals: FlashcardProposalViewModel[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (proposal: FlashcardProposalViewModel) => void;
}

const FlashcardProposalList: React.FC<FlashcardProposalListProps> = ({ proposals, onAccept, onReject, onEdit }) => {
  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Flashcard Proposals ({proposals.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proposals.map((proposal) => (
          <FlashcardProposalItem
            key={proposal.id}
            proposal={proposal}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
        <p>
          Review each proposal and decide whether to accept, edit, or reject it. Only accepted and edited flashcards
          will be saved.
        </p>
      </div>
    </div>
  );
};

FlashcardProposalList.propTypes = {
  proposals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      front: PropTypes.string.isRequired,
      back: PropTypes.string.isRequired,
      originalFront: PropTypes.string.isRequired,
      originalBack: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["pending", "accepted", "rejected", "edited"]).isRequired,
      source: PropTypes.oneOf(["ai-full", "ai-edited"]).isRequired,
    })
  ).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FlashcardProposalList;
