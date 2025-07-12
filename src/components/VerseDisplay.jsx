import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './VerseDisplay.css'; // Ensure highlight styles exist here

const VerseDisplay = ({
    bookId, chapterId, bibleData, chapterHeadings, bookInfo, isLoading, error, highlightedVerse, onVerseClick
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
        const headingForThisVerse = chapterHeadings.find(
          (h) => h.c === chapterId && h.v === verse.v
        );

        console.log(headingForThisVerse)
        return (
          <React.Fragment key={verseId}>
          {headingForThisVerse && (
            <div className="verse-heading">
              {headingForThisVerse.t && <i><small>{headingForThisVerse.t}</small></i>}
              <strong >{headingForThisVerse.h}</strong>
              {headingForThisVerse.sh && <small>{headingForThisVerse.sh}</small>}
            </div>
          )}
          <p id={verseId} className={`verse ${isHighlighted ? 'highlighted-persistent' : ''}`}>
            <span
              className="verse-number clickable"
              onClick={() => onVerseClick(verse.v)}
              role="button" tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onVerseClick(verse.v);
              }}
              aria-label={`Select verse ${verse.v}`}
            >
              {verse.v}
            </span>
            <span className="verse-text">{verse.t}</span>
          </p>
        </React.Fragment>
        );
       })}
    </div>
  );
};

export default VerseDisplay;