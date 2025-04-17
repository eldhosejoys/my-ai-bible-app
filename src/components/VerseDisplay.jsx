import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './VerseDisplay.css'; // Ensure highlight styles exist here

const VerseDisplay = ({
    bookId, chapterId, bibleData, bookInfo, isLoading, error, highlightedVerse, onVerseClick
}) => {

  const chapterVerses = bibleData?.[bookId]?.[chapterId] || [];

  // --- Loading / Error Checks ---
  if (isLoading && chapterVerses.length === 0) {
      return <div className="verse-display-loading">Loading Chapter {chapterId}...</div>;
  }
  if (error) { // Simplified error check - show global error if present
      return <ErrorMessage message={error} />;
  }
  if (!bookInfo) {
      return <ErrorMessage message="Book information is missing." />;
  }
  if (chapterVerses.length === 0 && !isLoading) {
      return <ErrorMessage message={`No verses found for ${bookInfo.bm} Chapter ${chapterId}.`} />;
  }
  // --- End Loading / Error Checks ---

  return (
    // Removed h2 title from here
    <div className="verses-container">
      {chapterVerses.map((verse) => {
        const isHighlighted = verse.v === highlightedVerse;
        const verseId = `verse-${bookId}-${chapterId}-${verse.v}`;
        return (
            <p key={verseId} id={verseId} className={`verse ${isHighlighted ? 'highlighted-persistent' : ''}`}>
              <span
                className="verse-number clickable" onClick={() => onVerseClick(verse.v)} role="button"
                tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onVerseClick(verse.v);}}
                aria-label={`Select verse ${verse.v}`}
              >{verse.v}</span>
              <span className="verse-text">{verse.t}</span>
            </p>
        );
       })}
    </div>
  );
};

export default VerseDisplay;