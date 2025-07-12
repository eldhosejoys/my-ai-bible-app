import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBibleData } from '../hooks/useBibleData';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import VerseDisplay from '../components/VerseDisplay';
import BookInfoDisplay from '../components/BookInfoDisplay';
import SearchBar from '../components/SearchBar';
import './BookView.css';

const BookView = () => {
  const params = useParams();
  const bookId = params.bookId;
  const chapterIdParam = params.chapterId;
  const verseIdParam = params.verseId;

  const { bibleData, bookTitles, isLoading: isDataLoading, error: dataError } = useBibleData();
  const navigate = useNavigate();

  // State
  const [currentChapter, setCurrentChapter] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [viewMode, setViewMode] = useState('chapter');
  const isInitialLoadDone = useRef(false);

  const bookInfo = bookTitles.find(b => b.n.toString() === bookId);
  const totalChapters = bookInfo?.c || 0;

  const currentBookIndex = bookTitles.findIndex(b => b.n.toString() === bookId);
  const prevBookExists = currentBookIndex > 0;
  const nextBookExists = currentBookIndex !== -1 && currentBookIndex < bookTitles.length - 1;
  const isLastBook = currentBookIndex === bookTitles.length - 1;

  const navigateBook = useCallback((direction) => {
    if (currentBookIndex === -1) return;

    let nextBookIndex = -1;
    if (direction === 'prev' && currentBookIndex > 0) {
      nextBookIndex = currentBookIndex - 1;
    } else if (direction === 'next' && currentBookIndex < bookTitles.length - 1) {
      nextBookIndex = currentBookIndex + 1;
    }

    if (nextBookIndex !== -1) {
      const nextBook = bookTitles[nextBookIndex];
      // Navigate to the first chapter of the next/previous book
      navigate(`/${nextBook.n}`, { replace: true });
      // Reset state for the new book
      setCurrentChapter(1); setHighlightedVerse(null); setViewMode('chapter');
    }
  }, [bookId, bookTitles, navigate, currentBookIndex]);

  // --- Effect 1: Set Chapter, Highlighted Verse from URL Path ---
  useEffect(() => {
    console.log("Effect 1: Processing URL Params");
    if (bookInfo) {
      let targetChapter = 1; let targetVerse = null;
      if (chapterIdParam) {
        const chapterNum = parseInt(chapterIdParam, 10);
        if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= bookInfo.c) { targetChapter = chapterNum; }
        else { console.warn(`Invalid chapter (${chapterIdParam}). Defaulting to 1.`); }
      }
      if (verseIdParam && targetChapter) {
        const verseNum = parseInt(verseIdParam, 10);
        if (!isNaN(verseNum) && verseNum >= 1) { targetVerse = verseNum; }
        else { console.warn(`Invalid verse (${verseIdParam}).`); }
      }
      let stateChanged = false;
      if (targetChapter !== currentChapter) { setCurrentChapter(targetChapter); stateChanged = true; if(viewMode !== 'chapter') setViewMode('chapter'); }
      if (targetVerse !== highlightedVerse) { setHighlightedVerse(targetVerse); if(viewMode !== 'chapter' && targetVerse !== null) setViewMode('chapter'); stateChanged = true; }
      if (!isInitialLoadDone.current) { isInitialLoadDone.current = true; console.log("Effect 1: Initial Load Done"); }
    } else if (!isDataLoading && bookId && bookTitles.length > 0) { console.error(`Book info not found for bookId: ${bookId}`); }
  }, [bookInfo, bookId, chapterIdParam, verseIdParam, currentChapter, highlightedVerse, viewMode, isDataLoading, bookTitles.length]);

  // --- Effect 2: Scroll to Highlighted Verse (if any) ---
  useEffect(() => {
     console.log(`Effect 2: Check scroll. InitialDone: ${isInitialLoadDone.current}, Mode: ${viewMode}, Chapter: ${currentChapter}, Highlight: ${highlightedVerse}`);
     if (isInitialLoadDone.current && viewMode === 'chapter' && currentChapter !== null && highlightedVerse !== null) {
        const scrollTimer = setTimeout(() => {
            const verseId = `verse-${bookId}-${currentChapter}-${highlightedVerse}`;
            const verseElement = document.getElementById(verseId);
            if (verseElement) {
                console.log(`Effect 2: Scrolling to ${verseId}`);
                const rect = verseElement.getBoundingClientRect();
                const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                if (!isVisible) { verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                else { console.log(`Effect 2: Verse ${verseId} already visible.`); }
            } else { console.warn(`Effect 2: Verse element not found for scrolling: ${verseId}`); }
        }, 250);
        return () => clearTimeout(scrollTimer);
      }
  }, [highlightedVerse, currentChapter, bookId, viewMode]);


  // --- Handlers (Keep as is) ---
  const handleChapterSelect = (chapterNum) => {
      if (chapterNum !== currentChapter || viewMode !== 'chapter') {
        setCurrentChapter(chapterNum); setViewMode('chapter'); setHighlightedVerse(null);
        navigate(`/${bookId}/${chapterNum}`, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleInfoSelect = () => {
    if (viewMode !== 'info') { setViewMode('info'); setHighlightedVerse(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
   const handleVerseClick = (verseNum) => {
      const newHighlightedVerse = verseNum === highlightedVerse ? null : verseNum;
      setHighlightedVerse(newHighlightedVerse);
      if (newHighlightedVerse) { navigate(`/${bookId}/${currentChapter}/${newHighlightedVerse}`, { replace: true }); }
      else { navigate(`/${bookId}/${currentChapter}`, { replace: true }); }
   };
  const navigateChapter = useCallback((direction) => {
      if (viewMode !== 'chapter' || currentChapter === null) return;
      let nextChap = currentChapter;
      if (direction === 'prev' && currentChapter > 1) nextChap = currentChapter - 1;
      else if (direction === 'next' && currentChapter < totalChapters) nextChap = currentChapter + 1;
      if (nextChap !== currentChapter) {
        setCurrentChapter(nextChap); setHighlightedVerse(null);
        navigate(`/${bookId}/${nextChap}`, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }, [currentChapter, totalChapters, viewMode, navigate, bookId]);
  useEffect(() => {
        const handleKeyDown = (event) => {
        if (viewMode === 'chapter') {
            if (event.key === 'ArrowLeft') navigateChapter('prev');
            else if (event.key === 'ArrowRight') navigateChapter('next');
        }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
   }, [navigateChapter, viewMode]);

  // --- Render Logic ---
  if (isDataLoading || !isInitialLoadDone.current || currentChapter === null || !bookInfo) {
       if (dataError) { return <ErrorMessage message={dataError} />; }
       return <LoadingSpinner />;
  }
  if (isNaN(currentChapter) || currentChapter < 1 || currentChapter > totalChapters) {
      return (
          <div className="book-view-container error-page">
              <ErrorMessage message={`Invalid chapter number: ${currentChapter}.`} />
              <Link to={`/${bookId}`} className="nav-button home-button" style={{marginTop: '15px'}}>Go to Chapter 1</Link>
          </div>
      );
  }

  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const prevChapterExists = viewMode === 'chapter' && currentChapter > 1;
  const nextChapterExists = viewMode === 'chapter' && currentChapter < totalChapters;

  return (
      <div className="book-view-container">
         {/* Top Bar */}
         <div className="book-view-top-bar">
             {/* Group Nav Buttons */}
             <div className="page-navigation-controls">
                <button onClick={() => navigate(-1)} className="nav-button back-button" title="Back">
                   ←
                </button>
                <Link to="/" className="nav-button home-button" title="Home" aria-label="Go to Home">
                    🏠
                </Link>
             </div>
             {/* Search Bar takes remaining space */}
             <SearchBar initialQuery="" />
         </div>

         {/* Book Title with Navigation */}
         <div className="book-title-container">
             {/* Previous Book Button */}
             {prevBookExists && (
             <button
                 onClick={() => navigateBook('prev')} className="nav-button book-nav-button prev-book"
                 title={prevBookExists ? bookTitles[currentBookIndex - 1].bm : ''} aria-label="Previous Book"
             >←</button>)}

             {/* Book Title */}
             <h1 className="book-view-title">
                 {bookInfo.bm} {/* Display main book name */}
                 {bookInfo.be && <span className="english-name"> ({bookInfo.be})</span>}
             </h1>
             {!isLastBook && (
             <button
                 onClick={() => navigateBook('next')} className={`nav-button book-nav-button next-book ${!nextBookExists ? 'disabled' : ''}`} disabled={!nextBookExists}
                 title={nextBookExists ? bookTitles[currentBookIndex + 1].bm : ''} aria-label={isLastBook ? 'Last Book' : 'Next Book'} disabled={isLastBook}
             >→</button>
             )}

         </div>

         {/* Current Chapter Indicator */}
         {viewMode === 'chapter' && currentChapter && (
            <h2 className="current-chapter-indicator">Chapter {currentChapter}</h2>
         )}

         {/* Chapter Navigation Grid */}
          <div className="book-view-chapter-nav">
              <button key="info" onClick={handleInfoSelect} className={`chapter-button info-button ${viewMode === 'info' ? 'active' : ''}`}>info</button>
             {chapters.map((chapterNum) => (
                <button
                    key={chapterNum} onClick={() => handleChapterSelect(chapterNum)}
                    className={`chapter-button ${viewMode === 'chapter' && chapterNum === currentChapter ? 'active' : ''}`}
                >{chapterNum}</button>
             ))}
         </div>

         {/* Main Content Area */}
          <div key={`content-${currentChapter}-${viewMode}`} className="main-content-area">
             {viewMode === 'chapter' ? (
                <VerseDisplay
                  bookId={bookId} chapterId={currentChapter} bibleData={bibleData}
                  bookInfo={bookInfo} isLoading={isDataLoading} error={dataError}
                  highlightedVerse={highlightedVerse} onVerseClick={handleVerseClick}
                />
              ) : ( <BookInfoDisplay bookInfo={bookInfo} /> )}
          </div>

         {/* Side Nav */}
         {prevChapterExists && ( <button className="side-nav-button prev-button" onClick={() => navigateChapter('prev')} disabled={viewMode !== 'chapter'}>←</button> )}
         {nextChapterExists && ( <button className="side-nav-button next-button" onClick={() => navigateChapter('next')} disabled={viewMode !== 'chapter'}>→</button> )}
     </div>
   );
};

export default BookView;