import { type FlashcardDTO } from "../types";
import FlashcardItem from "./FlashcardItem";

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FlashcardsList = ({ flashcards, onEdit, onDelete }: FlashcardsListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <FlashcardItem key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default FlashcardsList;
