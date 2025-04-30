import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import GenerateFlashcardsForm from "./GenerateFlashcardsForm";

// Mock the UI components with proper types
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    type,
    className,
    "data-testid": dataTestId,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    "data-testid"?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    value,
    onChange,
    disabled,
    placeholder,
    className,
    id,
    "data-testid": dataTestId,
  }: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    "data-testid"?: string;
  }) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      data-testid={dataTestId}
    />
  ),
}));

describe("GenerateFlashcardsForm", () => {
  // Constants from the component
  const MIN_TEXT_LENGTH = 1000;
  const MAX_TEXT_LENGTH = 10000;
  const ASYNC_TEST_TIMEOUT = 10000;

  // Setup common test variables
  const mockOnSubmit = vi.fn();
  const mockOnTextChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test rendering
  it("should render the form with all elements", () => {
    render(
      <GenerateFlashcardsForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        initialSourceText=""
        onTextChange={mockOnTextChange}
      />
    );

    // Check if key elements are present
    expect(screen.getByTestId("generate-form")).toBeInTheDocument();
    expect(screen.getByTestId("source-text-label")).toBeInTheDocument();
    expect(screen.getByTestId("source-text-input")).toBeInTheDocument();
    expect(screen.getByTestId("character-count")).toBeInTheDocument();
    expect(screen.getByTestId("generate-button")).toBeInTheDocument();
  });

  // Test initial state with empty text
  it("should show correct character count and disabled button with empty text", () => {
    render(
      <GenerateFlashcardsForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        initialSourceText=""
        onTextChange={mockOnTextChange}
      />
    );

    // Check character count
    expect(screen.getByTestId("character-count")).toHaveTextContent(`0 / ${MAX_TEXT_LENGTH} characters`);

    // Button should be disabled with empty text
    expect(screen.getByTestId("generate-button")).toBeDisabled();

    // No error should be displayed for empty text
    expect(screen.queryByTestId("source-text-error")).not.toBeInTheDocument();
  });

  // Test text below minimum length
  it(
    "should show error and disable button when text is below minimum length",
    async () => {
      render(
        <GenerateFlashcardsForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          initialSourceText=""
          onTextChange={mockOnTextChange}
        />
      );

      // Enter text below minimum length
      const shortText = "A".repeat(MIN_TEXT_LENGTH - 1);
      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: shortText } });

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByTestId("source-text-error")).toBeInTheDocument();
        expect(screen.getByTestId("source-text-error")).toHaveTextContent(/must be at least/i);
        expect(screen.getByTestId("generate-button")).toBeDisabled();
      });

      // Check that onTextChange callback was called
      expect(mockOnTextChange).toHaveBeenCalledWith(shortText);
    },
    ASYNC_TEST_TIMEOUT
  );

  // Test text above maximum length
  it(
    "should show error and disable button when text exceeds maximum length",
    async () => {
      // Start with text at maximum length
      const maxLengthText = "A".repeat(MAX_TEXT_LENGTH);

      render(
        <GenerateFlashcardsForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          initialSourceText={maxLengthText}
          onTextChange={mockOnTextChange}
        />
      );

      // Add one more character to exceed the limit
      const tooLongText = maxLengthText + "X";
      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: tooLongText } });

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByTestId("source-text-error")).toBeInTheDocument();
        expect(screen.getByTestId("source-text-error")).toHaveTextContent(/must not exceed/i);
        expect(screen.getByTestId("generate-button")).toBeDisabled();
      });

      expect(mockOnTextChange).toHaveBeenCalledWith(tooLongText);
    },
    ASYNC_TEST_TIMEOUT
  );

  // Test valid text length
  it(
    "should enable the button with valid text length",
    async () => {
      render(
        <GenerateFlashcardsForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          initialSourceText=""
          onTextChange={mockOnTextChange}
        />
      );

      // Enter text with valid length
      const validText = "A".repeat(MIN_TEXT_LENGTH);
      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: validText } });

      // No error should be displayed, button enabled
      await waitFor(() => {
        expect(screen.queryByTestId("source-text-error")).not.toBeInTheDocument();
        expect(screen.getByTestId("generate-button")).not.toBeDisabled();
      });

      expect(mockOnTextChange).toHaveBeenCalledWith(validText);
    },
    ASYNC_TEST_TIMEOUT
  );

  // Test form submission
  it("should call onSubmit when form is submitted with valid text", async () => {
    const validText = "A".repeat(MIN_TEXT_LENGTH);

    render(
      <GenerateFlashcardsForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        initialSourceText={validText}
        onTextChange={mockOnTextChange}
      />
    );

    // Button should be enabled initially
    expect(screen.getByTestId("generate-button")).not.toBeDisabled();

    // Click the submit button using userEvent
    await user.click(screen.getByTestId("generate-button"));

    // Check if onSubmit was called with the correct text
    expect(mockOnSubmit).toHaveBeenCalledWith(validText);
  });

  // Test loading state
  it("should disable input and button in loading state", () => {
    const validText = "A".repeat(MIN_TEXT_LENGTH);

    render(
      <GenerateFlashcardsForm
        onSubmit={mockOnSubmit}
        isLoading={true}
        initialSourceText={validText}
        onTextChange={mockOnTextChange}
      />
    );

    // Both textarea and button should be disabled
    expect(screen.getByTestId("source-text-input")).toBeDisabled();
    expect(screen.getByTestId("generate-button")).toBeDisabled();

    // Button should show loading text
    expect(screen.getByTestId("generating-state")).toHaveTextContent("Generating...");
  });

  // Test initial text rendering
  it("should render with initialSourceText value", () => {
    const initialText = "Initial test text ".repeat(60); // Ensure it meets min length

    render(
      <GenerateFlashcardsForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        initialSourceText={initialText}
        onTextChange={mockOnTextChange}
      />
    );

    // Check if textarea contains the initial text
    expect(screen.getByTestId("source-text-input")).toHaveValue(initialText);

    // Character count should reflect initialSourceText length
    expect(screen.getByTestId("character-count")).toHaveTextContent(
      `${initialText.length} / ${MAX_TEXT_LENGTH} characters`
    );
    // Button should be enabled if initial text is valid
    expect(screen.getByTestId("generate-button")).not.toBeDisabled();
  });

  // Test edge case: exactly minimum length
  it(
    "should accept text at exactly minimum length",
    async () => {
      const exactMinText = "A".repeat(MIN_TEXT_LENGTH);

      render(
        <GenerateFlashcardsForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          initialSourceText=""
          onTextChange={mockOnTextChange}
        />
      );

      // Enter text at exactly minimum length
      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: exactMinText } });
      // await user.type(screen.getByTestId("source-text-input"), exactMinText, { delay: 1 });

      // No error should be displayed, button enabled
      await waitFor(() => {
        expect(screen.queryByTestId("source-text-error")).not.toBeInTheDocument();
        expect(screen.getByTestId("generate-button")).not.toBeDisabled();
      });
    },
    ASYNC_TEST_TIMEOUT
  );

  // Test edge case: exactly maximum length
  it(
    "should accept text at exactly maximum length",
    async () => {
      const exactMaxText = "A".repeat(MAX_TEXT_LENGTH);

      render(
        <GenerateFlashcardsForm
          onSubmit={mockOnSubmit}
          isLoading={false}
          initialSourceText=""
          onTextChange={mockOnTextChange}
        />
      );

      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: exactMaxText } });

      await waitFor(() => {
        expect(screen.queryByTestId("source-text-error")).not.toBeInTheDocument();
        expect(screen.getByTestId("generate-button")).not.toBeDisabled();
      });
    },
    ASYNC_TEST_TIMEOUT
  );

  // Test without optional onTextChange callback
  it(
    "should work without onTextChange callback",
    async () => {
      render(<GenerateFlashcardsForm onSubmit={mockOnSubmit} isLoading={false} initialSourceText="" />);

      const validText = "A".repeat(MIN_TEXT_LENGTH);
      fireEvent.change(screen.getByTestId("source-text-input"), { target: { value: validText } });

      await waitFor(() => {
        expect(screen.getByTestId("generate-button")).not.toBeDisabled();
      });

      await user.click(screen.getByTestId("generate-button"));
      expect(mockOnSubmit).toHaveBeenCalledWith(validText);
    },
    ASYNC_TEST_TIMEOUT
  );
});
