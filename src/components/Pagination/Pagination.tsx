// src/components/Pagination/Pagination.tsx
import { useRef } from 'react';
import ReactPaginate from 'react-paginate';
import css from './Pagination.module.css';

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (selectedPage: number) => void;
}

export default function Pagination({
  pageCount,
  currentPage,
  onPageChange,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const PaginationComponent =
    (ReactPaginate as unknown as { default: typeof ReactPaginate }).default ||
    ReactPaginate;

  // Створюємо реф для ігнорування службових подій бібліотеки
  const prevPageRef = useRef(currentPage);
  const ignoreNextEvent = useRef(false);

  if (prevPageRef.current !== currentPage) {
    prevPageRef.current = currentPage;
    ignoreNextEvent.current = true; // Блокуємо наступний виклик від react-paginate
  }

  const handlePageClick = (event: { selected: number }) => {
    // Якщо це спрацював внутрішній збій бібліотеки — просто ігноруємо його
    if (ignoreNextEvent.current) {
      ignoreNextEvent.current = false;
      return;
    }

    const newPage = event.selected + 1;
    if (newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  return (
    <PaginationComponent
      forcePage={currentPage - 1}
      previousLabel={'<'}
      nextLabel={'>'}
      breakLabel={'...'}
      pageCount={pageCount}
      marginPagesDisplayed={1}
      pageRangeDisplayed={2}
      onPageChange={handlePageClick}
      containerClassName={css.pagination}
      activeClassName={css.active}
      pageClassName={css.pageItem}
      previousClassName={css.prevItem}
      nextClassName={css.nextItem}
      breakClassName={css.breakItem}
    />
  );
}