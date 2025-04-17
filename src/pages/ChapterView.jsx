// src/pages/ChapterView.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBibleData } from '../hooks/useBibleData';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './ChapterView.css';

const ChapterView = () => {
  const { bookId, chapterId } = useParams();
  const { bibleData, bookTitles, isLoading, error } = useBibleData();
  const navigate = useNavigate();

  const bookInfo = bookTitles.find(b => b.n.toString() === bookId);
  const chapterVerses = bibleData?.[bookId]?.[chapterId] || [];

  // Calculate next/prev chapter info
  const currentChapterNum = parseInt(chapterId, 10);
  const totalChapters = bookInfo?.c || 0;
  const prevChapter = currentChapterNum > 1 ? currentChapterNum - 1 : null;
  const nextChapter = currentChapterNum < totalChapters ? currentChapterNum + 1 : null;

  if (isLoading && !chapterVerses.length) {
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

  if (!bibleData || !bibleData[bookId] || !bibleData[bookId][chapterId]) {
       // Check if data exists but chapter might be invalid (e.g., chapter 99)
       if (bibleData && bookInfo) {
           return (
                <div>
                    <ErrorMessage message={`Chapter ${chapterId} not found in ${bookInfo.bm}.`} />
                    <button onClick={() => navigate(`/${bookId}`)} className="back-button">Back to Chapters</button>
                </div>
           );
       }
       // If data is generally missing (should be covered by loading/error above, but as fallback)
       return <ErrorMessage message={`Data for ${bookInfo.bm} Chapter ${chapterId} is currently unavailable.`} />;
  }


  return (
    <div className="chapter-view-container">
      <div className="navigation-header">
        <button onClick={() => navigate(`/${bookId}`)} className="back-button">
          ← {bookInfo.bm} Chapters
        </button>
        <h1 className="chapter-title">{bookInfo.bm} - Chapter {chapterId}</h1>
         {/* Placeholder for potential future actions */}
         <div className="header-actions"></div>
      </div>

      {error && <ErrorMessage message={error} /> }

      <div className="verses-container">
        {chapterVerses.map((verse) => (
          <p key={verse.v} className="verse">
            <span className="verse-number">{verse.v}</span>
            <span className="verse-text">{verse.t}</span>
          </p>
        ))}
      </div>

      <div className="chapter-navigation">
        {prevChapter ? (
          <Link to={`/${bookId}/chapter/${prevChapter}`} className="nav-link prev">
            ← Chapter {prevChapter}
          </Link>
        ) : (
          <span className="nav-link disabled">← Previous</span>
        )}
        {nextChapter ? (
          <Link to={`/${bookId}/chapter/${nextChapter}`} className="nav-link next">
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