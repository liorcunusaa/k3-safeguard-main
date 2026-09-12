import React from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50],
  itemLabel = "laporan",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with smart windowing
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <PaginationContainer>
      <PaginationInfo>
        Menampilkan <span>{startItem}</span> - <span>{endItem}</span> dari{" "}
        <span>{totalItems}</span> {itemLabel}
      </PaginationInfo>

      <PaginationActions>
        {onItemsPerPageChange && (
          <PerPageWrapper>
            <PerPageLabel>Baris:</PerPageLabel>
            <PerPageSelect
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </PerPageSelect>
          </PerPageWrapper>
        )}

        <NavButtonGroup>
          {/* First Page */}
          <NavBtn
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="Halaman Pertama"
            type="button"
          >
            <ChevronsLeft size={15} />
          </NavBtn>

          {/* Prev Page */}
          <NavBtn
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Halaman Sebelumnya"
            type="button"
          >
            <ChevronLeft size={15} />
          </NavBtn>

          {/* Page numbers */}
          {pages.map((p, idx) => {
            if (p === "...") {
              return <EllipsisSpan key={`ellipsis-${idx}`}>...</EllipsisSpan>;
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <PageNumberBtn
                key={pageNum}
                $active={isActive}
                onClick={() => onPageChange(pageNum)}
                type="button"
              >
                {pageNum}
              </PageNumberBtn>
            );
          })}

          {/* Next Page */}
          <NavBtn
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Halaman Berikutnya"
            type="button"
          >
            <ChevronRight size={15} />
          </NavBtn>

          {/* Last Page */}
          <NavBtn
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Halaman Terakhir"
            type="button"
          >
            <ChevronsRight size={15} />
          </NavBtn>
        </NavButtonGroup>
      </PaginationActions>
    </PaginationContainer>
  );
}

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;

  span {
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const PaginationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PerPageWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const PerPageLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
`;

const PerPageSelect = styled.select`
  background: var(--bg-card-subtle, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
  }
`;

const NavButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NavBtn = styled.button`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-card-subtle, rgba(255, 255, 255, 0.05));
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--bg-card-hover, rgba(255, 255, 255, 0.1));
    color: var(--text-primary);
    border-color: #3b82f6;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const PageNumberBtn = styled.button<{ $active: boolean }>`
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  border: 1px solid ${({ $active }) => ($active ? "#3b82f6" : "var(--border-color)")};
  background: ${({ $active }) =>
    $active ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "var(--bg-card-subtle, rgba(255, 255, 255, 0.05))"};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-secondary)")};
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none")};
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-primary)")};
  }
`;

const EllipsisSpan = styled.span`
  padding: 0 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
  user-select: none;
`;
