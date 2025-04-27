import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PropTypes from "prop-types";

interface GenerateFlashcardsFormProps {
  onSubmit: (sourceText: string) => void;
  isLoading: boolean;
  initialSourceText: string;
  onTextChange?: (text: string) => void;
  "data-testid"?: string;
}

const MIN_TEXT_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;

const GenerateFlashcardsForm: React.FC<GenerateFlashcardsFormProps> = ({
  onSubmit,
  isLoading,
  initialSourceText,
  onTextChange,
  "data-testid": dataTestId,
}) => {
  const [sourceText, setSourceText] = useState(initialSourceText);
  const [error, setError] = useState<string | null>(null);

  // Validate source text length
  useEffect(() => {
    if (sourceText.length === 0) {
      setError(null);
    } else if (sourceText.length < MIN_TEXT_LENGTH) {
      setError(`Text must be at least ${MIN_TEXT_LENGTH} characters long (currently ${sourceText.length})`);
    } else if (sourceText.length > MAX_TEXT_LENGTH) {
      setError(`Text must not exceed ${MAX_TEXT_LENGTH} characters (currently ${sourceText.length})`);
    } else {
      setError(null);
    }
  }, [sourceText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!error && sourceText.length >= MIN_TEXT_LENGTH && sourceText.length <= MAX_TEXT_LENGTH) {
      onSubmit(sourceText);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSourceText(newText);
    // Call the onTextChange prop if provided
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid={dataTestId || "generate-form"}>
      <div className="space-y-2" data-testid="source-text-container">
        <label htmlFor="sourceText" className="text-sm font-medium" data-testid="source-text-label">
          Source Text
        </label>
        <Textarea
          id="sourceText"
          value={sourceText}
          onChange={handleChange}
          placeholder="Enter your text here (minimum 1000 characters, maximum 10000 characters)"
          className="min-h-[200px]"
          disabled={isLoading}
          data-testid="source-text-input"
        />

        <div className="flex justify-between text-sm" data-testid="character-count-container">
          <span
            className={
              sourceText.length < MIN_TEXT_LENGTH || sourceText.length > MAX_TEXT_LENGTH
                ? "text-red-500"
                : "text-gray-500"
            }
            data-testid="character-count"
          >
            {sourceText.length} / {MAX_TEXT_LENGTH} characters
          </span>
          {error && (
            <span className="text-red-500" data-testid="source-text-error">
              {error}
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!!error || sourceText.length < MIN_TEXT_LENGTH || isLoading}
        className="w-full sm:w-auto"
        data-testid="generate-button"
      >
        {isLoading ? <span data-testid="generating-state">Generating...</span> : "Generate Flashcard Proposals"}
      </Button>
    </form>
  );
};

GenerateFlashcardsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  initialSourceText: PropTypes.string.isRequired,
  onTextChange: PropTypes.func,
  "data-testid": PropTypes.string,
};

export default GenerateFlashcardsForm;
