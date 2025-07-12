
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BooksDropdown.css'; // Assuming you'll create a CSS file for styling

const BooksDropdown = ({ bookTitles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleBookSelect = (book) => {
    navigate(`/${book.n}`);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="books-dropdown-container">
      <button title="Books" className="books-dropdown-button" onClick={() => setIsOpen(!isOpen)}>
      📖
      </button>
      {isOpen && (
        <div className="books-dropdown-menu">
          {bookTitles.map((book) => (
            <div
              key={book.n}
              className="books-dropdown-item"
              onClick={() => handleBookSelect(book)}
            >
              {book.bm} 
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksDropdown;