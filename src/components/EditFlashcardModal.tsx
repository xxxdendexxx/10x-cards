import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardDTO, FlashcardUpdateDto } from "../types";

// Schema walidacji formularza
const flashcardFormSchema = z.object({
  front: z.string().min(1, "Przód fiszki jest wymagany").max(1000, "Przód fiszki może mieć maksymalnie 1000 znaków"),
  back: z.string().min(1, "Tył fiszki jest wymagany").max(1000, "Tył fiszki może mieć maksymalnie 1000 znaków"),
});

type FormValues = z.infer<typeof flashcardFormSchema>;

interface EditFlashcardModalProps {
  isOpen: boolean;
  flashcard: FlashcardDTO | null;
  onSave: (id: string, data: FlashcardUpdateDto) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const EditFlashcardModal = ({ isOpen, flashcard, onSave, onCancel, isLoading }: EditFlashcardModalProps) => {
  const [error, setError] = useState<string | null>(null);

  console.log("Modal render:", { isOpen, flashcard }); // Debugging

  // Inicjalizacja formularza
  const form = useForm<FormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: flashcard?.front || "",
      back: flashcard?.back || "",
    },
  });

  // Aktualizacja wartości formularza gdy zmienia się flashcard
  useEffect(() => {
    console.log("Flashcard effect triggered:", flashcard); // Debugging
    if (flashcard) {
      form.reset({
        front: flashcard.front,
        back: flashcard.back,
      });
    }
  }, [flashcard, form]);

  // Obsługa zapisu
  const handleSubmit = form.handleSubmit(async (data: FormValues) => {
    if (!flashcard) return;

    setError(null);
    try {
      await onSave(flashcard.id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania fiszki");
    }
  });

  const handleOpenChange = (open: boolean) => {
    console.log("Dialog open change:", open); // Debugging
    if (!open) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Zaktualizuj treść przodu i tyłu fiszki. Kliknij zapisz, gdy skończysz.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przód</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Wpisz treść przodu fiszki..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tył</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Wpisz treść tyłu fiszki..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="p-3 text-sm bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardModal;
