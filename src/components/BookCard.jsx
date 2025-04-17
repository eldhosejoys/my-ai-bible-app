import React from 'react';
import { Link } from 'react-router-dom'; // Only Link is needed
import './BookCard.css'; // CSS will be updated

const BookCard = ({ book }) => {
  // No state or handlers needed anymore for expansion

  return (
    // Make the entire card area a single clickable link
    <Link to={`/${book.n}`} className="book-card-link">
      <div className="book-card">
        {/* Malayalam Book Name */}
        <h3 className="book-name-ml">{book.bm}</h3>

        {/* Meta Information (Writer & Date) */}
        <div className="book-meta">
            {/* Writer (Malayalam only) */}
            {book.w && (
              <p className="book-writer">
                  <span className="meta-text"><span className="icon writer-icon">📝</span> {book.w}</span>
              </p>
            )}
            {/* Date (Malayalam only) */}
            {book.d && (
              <p className="book-date">
                <span className="meta-text"><span className="icon date-icon">📅</span> {book.d}</span>
              </p>
            )}
        </div>
        {/* Removed chapters container and toggle button */}
      </div>
    </Link>
  );
};

export default BookCard;