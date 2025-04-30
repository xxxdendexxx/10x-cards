import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirmationDialog = ({ isOpen, onConfirm, onCancel, isLoading }: DeleteConfirmationDialogProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszki");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Potwierdź usunięcie</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie fiszki z
            Twojej kolekcji.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <div className="p-3 mt-2 text-sm bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              Anuluj
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Usuwanie..." : "Usuń fiszkę"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
