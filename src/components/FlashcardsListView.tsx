import { useState, useEffect } from "react";
import type { FlashcardDTO, PaginationDTO, FlashcardUpdateDto } from "../types";
import FlashcardsList from "./FlashcardsList";
import PaginationControls from "./PaginationControls";
import EditFlashcardModal from "./EditFlashcardModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

// Custom hook do zarządzania danymi fiszek
const useFlashcardsData = () => {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO>({
    page: 1,
    pageSize: 3,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDTO | null>(null);
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFlashcards = async (page = 1) => {
    console.log("Pobieranie fiszek dla strony:", page);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards?page=${page}&pageSize=${pagination.pageSize}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFlashcards(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Pobierz dane przy montowaniu komponentu i przy zmianie strony
  useEffect(() => {
    fetchFlashcards(currentPage);
  }, [currentPage]);

  // Funkcja do zmiany strony
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Funkcje zarządzające edycją fiszki
  const editFlashcard = (id: string) => {
    console.log("Rozpoczynam edycję fiszki z ID:", id, "typ:", typeof id);
    const flashcard = flashcards.find((f) => f.id === id);

    console.log("Znaleziona fiszka:", flashcard);

    if (flashcard) {
      setEditingFlashcard(flashcard);
      setIsEditModalOpen(true);
      console.log("Modal powinien się otworzyć:", { isEditModalOpen: true, editingFlashcard: flashcard });
    } else {
      console.error("Nie znaleziono fiszki o ID:", id);
    }
  };

  const closeEditModal = () => {
    console.log("Zamykam modal edycji");
    setIsEditModalOpen(false);
    setEditingFlashcard(null);
  };

  const saveEdit = async (id: string, data: FlashcardUpdateDto) => {
    console.log("Zapisuję edycję fiszki:", { id, data });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Po sukcesie - odśwież listę fiszek
      await fetchFlashcards(currentPage);
      closeEditModal();
    } catch (err) {
      setError(err instanceof Error ? err : String(err));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcje zarządzające usuwaniem fiszki
  const deleteFlashcard = (id: string) => {
    console.log("Rozpoczynam usuwanie fiszki z ID:", id);
    setDeletingFlashcardId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    console.log("Zamykam dialog usuwania");
    setIsDeleteDialogOpen(false);
    setDeletingFlashcardId(null);
  };

  const confirmDelete = async () => {
    if (deletingFlashcardId === null) return Promise.resolve();

    console.log("Potwierdzam usunięcie fiszki o ID:", deletingFlashcardId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/${deletingFlashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Po sukcesie - odśwież listę fiszek
      await fetchFlashcards(currentPage);
      closeDeleteDialog();
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : String(err));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flashcards,
    pagination,
    isLoading,
    error,
    currentPage,
    editFlashcard,
    deleteFlashcard,
    saveEdit,
    confirmDelete,
    changePage,
    editingFlashcard,
    deletingFlashcardId,
    isEditModalOpen,
    isDeleteDialogOpen,
    closeEditModal,
    closeDeleteDialog,
  };
};

// Komponent główny dla widoku listy fiszek
const FlashcardsListView = () => {
  const {
    flashcards,
    pagination,
    isLoading,
    error,
    currentPage,
    editFlashcard,
    deleteFlashcard,
    changePage,
    saveEdit,
    confirmDelete,
    editingFlashcard,
    isEditModalOpen,
    isDeleteDialogOpen,
    closeEditModal,
    closeDeleteDialog,
  } = useFlashcardsData();

  if (isLoading && flashcards.length === 0) {
    return <div className="flex justify-center my-12">Ładowanie fiszek...</div>;
  }

  if (error && flashcards.length === 0) {
    return (
      <div className="my-8 p-4 border border-red-200 rounded bg-red-50 text-red-700">
        <p>Nie udało się załadować fiszek. Spróbuj ponownie.</p>
        <p className="text-sm mt-2">{String(error)}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded"
          onClick={() => changePage(currentPage)}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (pagination.total === 0) {
    return (
      <div className="text-center my-12 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-medium mb-2">Nie masz jeszcze żadnych fiszek</h2>
        <p className="text-gray-600 mb-4">Stwórz swoje pierwsze fiszki, aby rozpocząć naukę!</p>
        {/* Tu można dodać przycisk do tworzenia fiszek, jeśli taka funkcjonalność będzie dodana */}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Wyświetlanie {flashcards.length} z {pagination.total} fiszek
      </p>

      {/* Lista fiszek */}
      <FlashcardsList flashcards={flashcards} onEdit={editFlashcard} onDelete={deleteFlashcard} />

      {/* Kontrolki paginacji */}
      <PaginationControls pagination={pagination} currentPage={currentPage} onPageChange={changePage} />

      {/* Komponenty modalne */}
      <EditFlashcardModal
        isOpen={isEditModalOpen}
        flashcard={editingFlashcard}
        onSave={saveEdit}
        onCancel={closeEditModal}
        isLoading={isLoading}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FlashcardsListView;
