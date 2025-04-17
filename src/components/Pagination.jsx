import React from 'react';
import './Pagination.css';

// Improved Pagination with Ellipsis and Boundary Links like image
const Pagination = ({ currentPage, totalPages, onPageChange, siblings = 1 }) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);

  const paginationRange = () => {
    const totalPageNumbers = siblings * 2 + 3; // Current + 2*siblings + First + Last
    const totalBlocks = totalPageNumbers + 2; // Add potential Ellipsis

    // Case 1: Total pages is less than or equal to the numbers we want to show
    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2; // More than 1 page before left sibling
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1; // More than 1 page after right sibling

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 1 + 2 * siblings + 1; // FirstPage + CurrentPage + Siblings + Ellipsis
      let leftRange = range(1, leftItemCount);
      return [...leftRange, '...', lastPageIndex];
    }

    // Case 3: Left dots, no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 1 + 2 * siblings + 1;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 4: Both dots shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    // Default case (should not be reached if logic is correct)
    return range(1, totalPages);
  };

  const pages = paginationRange();

  return (
    <nav className="pagination-container" aria-label="Search results pagination">
      <button
        key="prev-group"
        onClick={() => handlePageClick(1)} // Go to first page
        className="page-button boundary" // Re-styled boundary
        disabled={currentPage === 1}
        aria-label="First page"
      >
        {'<<'}
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>;
        }
        if(currentPage === page) {
          return(
            <select key={page}
              className={`page-button active`}
              aria-current="page"
              aria-label={`Go to page ${page}`}
              value={currentPage}
              onChange={(e) => handlePageClick(Number(e.target.value))}
            >
                {range(1, totalPages).map(pageNumber => (
                    <option key={pageNumber} value={pageNumber}>
                        {pageNumber}
                    </option>
                ))}
            </select>
          )
        } else return (
          <button key={page} onClick={() => handlePageClick(page)} className={`page-button`} aria-label={`Go to page ${page}`}> {page}
            {currentPage === page && <span className="active-indicator">▼</span>}
          </button>
        );
      })}

      <button
        key="next-group"
        onClick={() => handlePageClick(totalPages)} // Go to last page
        className="page-button boundary" // Re-styled boundary
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        {'>>'}
      </button>
    </nav>
  );
};

export default Pagination;