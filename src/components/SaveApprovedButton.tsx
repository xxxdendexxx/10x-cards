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
        {isLoading ? "Zapisywanie..." : "Zapisz zatwierdzone fiszki"}
      </Button>

      <p className="text-sm text-gray-500 mt-2">
        {!isEnabled
          ? "Musisz zaakceptować lub edytować przynajmniej jedną fiszkę, aby zapisać."
          : "Tylko zatwierdzone i edytowane fiszki zostaną zapisane do Twojej kolekcji."}
      </p>
    </div>
  );
};

export default SaveApprovedButton;
