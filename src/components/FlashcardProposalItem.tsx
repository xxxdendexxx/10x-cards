import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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

interface FlashcardProposalItemProps {
  proposal: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (proposal: FlashcardProposalViewModel) => void;
}

const FlashcardProposalItem: React.FC<FlashcardProposalItemProps> = ({ proposal, onAccept, onReject, onEdit }) => {
  // Generate status-based styling
  const getCardClasses = () => {
    const baseClasses = "transition-all duration-200";

    switch (proposal.status) {
      case "accepted":
        return `${baseClasses} border-2 border-green-500`;
      case "rejected":
        return `${baseClasses} border-red-300 opacity-50`;
      case "edited":
        return `${baseClasses} border-2 border-blue-500`;
      default:
        return baseClasses;
    }
  };

  // Generate status badge
  const getStatusBadge = () => {
    switch (proposal.status) {
      case "accepted":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Accepted</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case "edited":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Edited</span>;
      default:
        return null;
    }
  };

  return (
    <Card className={getCardClasses()}>
      <CardContent className="pt-6 pb-2">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Front</h3>
          {getStatusBadge()}
        </div>
        <p className="p-3 bg-gray-50 rounded-md mb-6">{proposal.front}</p>

        <h3 className="text-lg font-medium mb-2">Back</h3>
        <p className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{proposal.back}</p>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap justify-end border-t pt-4">
        {proposal.status === "pending" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onAccept(proposal.id)}>
              Accept
            </Button>

            <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:border-red-300"
              onClick={() => onReject(proposal.id)}
            >
              Reject
            </Button>
          </>
        )}

        {proposal.status === "accepted" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:border-red-300"
              onClick={() => onReject(proposal.id)}
            >
              Reject
            </Button>
          </>
        )}

        {proposal.status === "rejected" && (
          <Button variant="outline" size="sm" onClick={() => onAccept(proposal.id)}>
            Accept
          </Button>
        )}

        {proposal.status === "edited" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
              Edit Again
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:border-red-300"
              onClick={() => onReject(proposal.id)}
            >
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default FlashcardProposalItem;
