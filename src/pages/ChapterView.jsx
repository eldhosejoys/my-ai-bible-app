// src/pages/ChapterView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBibleData } from '../hooks/useBibleData';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './ChapterView.css';

const ChapterView = () => {
  const { bookId, chapterId } = useParams();
  const { 
    bibleData, 
    bookTitles, 
    isLoading, // for initial titles/headings
    isBibleLoading, // for full bible text
    error, 
    loadBibleData // function to load bible text
  } = useBibleData();
  const navigate = useNavigate();

  useEffect(() => {
    // If the main bible data isn't loaded yet, load it.
    if (!bibleData) {
      loadBibleData();
    }
  }, [bibleData, loadBibleData]);

  const bookInfo = bookTitles.find(b => b.n.toString() === bookId);
  const chapterVerses = bibleData?.[bookId]?.[chapterId] || [];

  // Calculate next/prev chapter info
  const currentChapterNum = parseInt(chapterId, 10);
  const totalChapters = bookInfo?.c || 0;
  const prevChapter = currentChapterNum > 1 ? currentChapterNum - 1 : null;
  const nextChapter = currentChapterNum < totalChapters ? currentChapterNum + 1 : null;

  if (isLoading || (isBibleLoading && !chapterVerses.length)) {
    return <LoadingSpinner />;
  }

   if (error && !chapterVerses.length) {
      return (
          <div>
              <ErrorMessage message={error} />
               <button onClick={() => navigate(`/${bookId}`)} className="back-button">Back to Chapters</button>
          </div>
      );
  }

  if (!bookInfo) {
    return <ErrorMessage message={`Book ${bookId} not found.`} />;
  }

  // This condition handles cases where the chapter doesn't exist for a loaded book
  if (bibleData && (!bibleData[bookId] || !bibleData[bookId][chapterId])) {
    return (
        <div>
            <ErrorMessage message={`Chapter ${chapterId} not found in ${bookInfo.bm}.`} />
            <button onClick={() => navigate(`/${bookId}`)} className="back-button">Back to Chapters</button>
        </div>
    );
  }

  return (
    <div className="chapter-view-container">
      <div className="navigation-header">
        <button onClick={() => navigate(`/${bookId}`)} className="back-button">
          ← {bookInfo.bm} Chapters
        </button>
        <h1 className="chapter-title">{bookInfo.bm} - Chapter {chapterId}</h1>
         <div className="header-actions"></div>
      </div>

      {error && !isBibleLoading && <ErrorMessage message={error} />}

      <div className="verses-container">
        {chapterVerses.length > 0 ? (
          chapterVerses.map((verse) => (
            <p key={verse.v} id={`v${verse.v}`} className="verse">
              <span className="verse-number">{verse.v}</span>
              <span className="verse-text">{verse.t}</span>
            </p>
          ))
        ) : (
          !isBibleLoading && <p>No verses found for this chapter.</p>
        )}
      </div>

      <div className="chapter-navigation">
        {prevChapter ? (
          <Link to={`/${bookId}/${prevChapter}`} className="nav-link prev">
            ← Chapter {prevChapter}
          </Link>
        ) : (
          <span className="nav-link disabled">← Previous</span>
        )}
        {nextChapter ? (
          <Link to={`/${bookId}/${nextChapter}`} className="nav-link next">
            Chapter {nextChapter} →
          </Link>
        ) : (
          <span className="nav-link disabled">Next →</span>
        )}
      </div>
    </div>
  );
};

export default ChapterView;
