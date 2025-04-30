import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationDTO } from "../types";

interface PaginationControlsProps {
  pagination: PaginationDTO;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ pagination, currentPage, onPageChange }) => {
  const { pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  // Tworzymy tablicę z numerami stron do wyświetlenia
  const getPageNumbers = () => {
    const pageNumbers: (number | "ellipsis")[] = [];

    // Zawsze pokazujemy pierwszą stronę
    pageNumbers.push(1);

    // Dodajemy elipsy jeśli obecna strona jest wystarczająco oddalona od pierwszej
    if (currentPage > 3) {
      pageNumbers.push("ellipsis");
    }

    // Dodajemy strony wokół obecnej
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }

    // Dodajemy elipsy jeśli obecna strona jest wystarczająco oddalona od ostatniej
    if (currentPage < totalPages - 2) {
      pageNumbers.push("ellipsis");
    }

    // Zawsze pokazujemy ostatnią stronę, jeśli mamy więcej niż 1 stronę
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Sprawdzamy czy przycisk Poprzednia/Następna powinien być aktywny
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => !isPreviousDisabled && onPageChange(currentPage - 1)}
            className={isPreviousDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            tabIndex={isPreviousDisabled ? -1 : 0}
          />
        </PaginationItem>

        {pageNumbers.map((pageNumber, index) => (
          <PaginationItem key={`${pageNumber}-${index}`}>
            {pageNumber === "ellipsis" ? (
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            ) : (
              <PaginationLink
                isActive={pageNumber === currentPage}
                onClick={() => onPageChange(pageNumber)}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
            className={isNextDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            tabIndex={isNextDisabled ? -1 : 0}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
