import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FlashcardProposalItem from "./FlashcardProposalItem";

// Przygotowanie mocków dla funkcji obsługi wydarzeń
const mockOnAccept = vi.fn();
const mockOnReject = vi.fn();
const mockOnEdit = vi.fn();

// Przygotowanie przykładowej fiszki
const mockProposal = {
  id: "1",
  front: "Przykładowe pytanie",
  back: "Przykładowa odpowiedź",
  originalFront: "Przykładowe pytanie",
  originalBack: "Przykładowa odpowiedź",
  status: "pending" as const,
  source: "ai-full" as const,
};

describe("FlashcardProposalItem", () => {
  // Resetowanie mocków przed każdym testem
  beforeEach(() => {
    mockOnAccept.mockReset();
    mockOnReject.mockReset();
    mockOnEdit.mockReset();
  });

  it("renderuje zawartość fiszki (przód i tył)", () => {
    render(
      <FlashcardProposalItem
        proposal={mockProposal}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Sprawdzenie, czy treść jest poprawnie wyświetlana
    expect(screen.getByText("Przykładowe pytanie")).toBeInTheDocument();
    expect(screen.getByText("Przykładowa odpowiedź")).toBeInTheDocument();
  });

  it("wywołuje funkcję onAccept po kliknięciu przycisku Accept", () => {
    render(
      <FlashcardProposalItem
        proposal={mockProposal}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Znalezienie przycisku i kliknięcie go
    const acceptButton = screen.getByRole("button", { name: /accept/i });
    fireEvent.click(acceptButton);

    // Sprawdzenie czy funkcja została wywołana z odpowiednim ID
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
    expect(mockOnAccept).toHaveBeenCalledWith("1");
  });

  it("wywołuje funkcję onReject po kliknięciu przycisku Reject", () => {
    render(
      <FlashcardProposalItem
        proposal={mockProposal}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Znalezienie przycisku i kliknięcie go
    const rejectButton = screen.getByRole("button", { name: /reject/i });
    fireEvent.click(rejectButton);

    // Sprawdzenie czy funkcja została wywołana z odpowiednim ID
    expect(mockOnReject).toHaveBeenCalledTimes(1);
    expect(mockOnReject).toHaveBeenCalledWith("1");
  });

  it("wywołuje funkcję onEdit po kliknięciu przycisku Edit", () => {
    render(
      <FlashcardProposalItem
        proposal={mockProposal}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Znalezienie przycisku i kliknięcie go
    const editButton = screen.getByRole("button", { name: /edit$/i });
    fireEvent.click(editButton);

    // Sprawdzenie czy funkcja została wywołana z obiektem propozycji
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProposal);
  });

  it('wyświetla odpowiednie przyciski dla statusu "accepted"', () => {
    const acceptedProposal = { ...mockProposal, status: "accepted" as const };

    render(
      <FlashcardProposalItem
        proposal={acceptedProposal}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Sprawdzenie wyświetlanych przycisków
    expect(screen.queryByRole("button", { name: /accept/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });
});
