import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Zod schema for validation
const flashcardSchema = z.object({
  front: z
    .string()
    .trim()
    .min(1, { message: "Front is required." })
    .max(200, { message: "Front must be 200 characters or less." }),
  back: z
    .string()
    .trim()
    .min(1, { message: "Back is required." })
    .max(500, { message: "Back must be 500 characters or less." }),
});

// ViewModel for the form data (derived from schema)
export type ManualFlashcardFormData = z.infer<typeof flashcardSchema>;

interface AddFlashcardFormProps {
  onSubmit: (data: ManualFlashcardFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const AddFlashcardForm: React.FC<AddFlashcardFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const form = useForm<ManualFlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  // Wrapper function to handle submission and potential API errors
  const handleFormSubmit = async (data: ManualFlashcardFormData) => {
    try {
      await onSubmit(data);
      // Reset form on successful submission handled by parent (closing modal)
      // form.reset(); // Optionally reset here if modal doesn't always close
    } catch (error) {
      // API errors are handled by the parent component via toast
      console.error("Submission error caught in form:", error);
    }
  };

  return (
    // Use Shadcn Form component
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Front</FormLabel>
              <FormControl>
                <Input placeholder="Enter the front text" {...field} disabled={isLoading} maxLength={200} />
              </FormControl>
              <FormDescription>The question or term (max 200 chars).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Back</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the back text" {...field} disabled={isLoading} maxLength={500} rows={4} />
              </FormControl>
              <FormDescription>The answer or definition (max 500 chars).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons remain outside FormField */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddFlashcardForm;
