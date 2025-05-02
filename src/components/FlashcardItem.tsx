import { type FlashcardDTO } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "lucide-react";

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FlashcardItem = ({ flashcard, onEdit, onDelete }: FlashcardItemProps) => {
  // Przekazujemy ID bezpośrednio jako string, bez konwersji
  const handleEdit = () => {
    console.log("Wywołuję edycję dla ID:", flashcard.id, "typ:", typeof flashcard.id);
    onEdit(flashcard.id);
  };

  const handleDelete = () => {
    console.log("Wywołuję usunięcie dla ID:", flashcard.id, "typ:", typeof flashcard.id);
    onDelete(flashcard.id);
  };

  // Funkcja zwracająca odpowiedni wariant badge dla źródła fiszki
  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "ai-full":
        return "secondary";
      case "ai-edited":
        return "outline";
      case "manual":
      default:
        return "default";
    }
  };

  // Funkcja zwracająca czytelną nazwę źródła
  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ai-full":
        return "AI";
      case "ai-edited":
        return "AI (edytowane)";
      case "manual":
        return "Ręcznie";
      default:
        return source;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="font-medium">Przód</div>
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        <p className="break-words whitespace-pre-wrap">{flashcard.front}</p>

        <div className="mt-4 pt-4 border-t">
          <div className="font-medium mb-2">Tył</div>
          <p className="break-words whitespace-pre-wrap text-gray-700">{flashcard.back}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between border-t">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{new Date(flashcard.updated_at).toLocaleDateString()}</span>
          <Badge variant={getSourceBadgeVariant(flashcard.source)}>{getSourceLabel(flashcard.source)}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Usuń
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FlashcardItem;
