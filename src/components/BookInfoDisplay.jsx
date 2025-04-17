// src/components/BookInfoDisplay.jsx
import React from 'react';
import './BookInfoDisplay.css';

const BookInfoDisplay = ({ bookInfo }) => {
  if (!bookInfo) {
    return <div className="book-info-container"><div>പുസ്തക വിവരങ്ങൾ ലഭ്യമല്ല.</div></div>;
  }

  return (
    <div className="book-info-container" >
      <h2 className="book-info-title">പുസ്തക വിവരങ്ങൾ</h2>
      {bookInfo.bm && (
        <div className="info-item"> &#128214; <strong>{bookInfo.bm}</strong></div>
      )}
      {bookInfo.w && (
        <div className="info-item"> 📝 <strong>{bookInfo.w}</strong></div>
      )}
      {bookInfo.d && (
        <div className="info-item"> &#128197; <strong>{bookInfo.d}</strong></div>
      )}
    </div>
  );
};

export default BookInfoDisplay;