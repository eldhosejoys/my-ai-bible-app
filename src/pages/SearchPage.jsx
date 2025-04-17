import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useBibleData } from '../hooks/useBibleData';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import HighlightText from '../components/HighlightText';
import '../pages/SearchPage.css';
import '../components/Pagination.css';

const RESULTS_PER_PAGE = 100;

const SearchPage = () => {
  const { bibleData, bookTitles, isLoading: isDataLoading, error: dataError } = useBibleData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Derive state directly from URL where possible
  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);
  const currentPage = useMemo(() => {
      const page = parseInt(searchParams.get('page') || '1', 10);
      return page > 0 ? page : 1;
  }, [searchParams]);

  // State for results and loading/error status
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // --- Search Execution Logic ---
  const executeSearch = useCallback((term) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) { setSearchResults([]); setIsSearching(false); setSearchError(''); return; }
    if (!bibleData || !bookTitles.length) { if (!isDataLoading) setSearchError('Bible data not yet available.'); setIsSearching(false); return; }
    setIsSearching(true); setSearchError(''); setSearchResults([]);
    setTimeout(() => {
        const lowerTerm = trimmedTerm.toLowerCase(); const results = [];
        try {
            for (const bookId in bibleData) {
                 const bookInfo = bookTitles.find(b => b.n.toString() === bookId); if (!bookInfo) continue;
                 for (const chapterId in bibleData[bookId]) {
                    for (const verse of bibleData[bookId][chapterId]) {
                        if (verse.t && verse.t.toLowerCase().includes(lowerTerm)) { results.push({ b: bookId, c: chapterId, v: verse.v, t: verse.t, bookName: bookInfo.bm }); } } } }
            if (results.length === 0) setSearchError(`No results found for "${trimmedTerm}".`); else setSearchError('');
            setSearchResults(results);
        } catch (err) { setSearchError("Search error."); setSearchResults([]); }
        finally { setIsSearching(false); }
    }, 50);
  }, [bibleData, bookTitles, isDataLoading]);

  // --- Effect to Trigger Search When URL 'q' Changes ---
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    executeSearch(queryFromUrl);
  }, [searchParams, executeSearch]); // Depends only on URL params and the stable search function

  // --- Pagination Logic ---
  const totalResults = searchResults.length;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  const validatedCurrentPage = Math.min(Math.max(1, currentPage), totalPages > 0 ? totalPages : 1);
  const startIndex = (validatedCurrentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentResults = searchResults.slice(startIndex, endIndex);

  // --- Page Change Handler ---
  const handlePageChange = (page) => {
    if (page !== validatedCurrentPage) {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', page.toString());
            if (query) newParams.set('q', query); else newParams.delete('q');
            return newParams;
        }, { replace: true });
        const resultsContainer = document.querySelector('.search-results-container h2');
        if (resultsContainer) { resultsContainer.scrollIntoView({ behavior: 'instant', block: 'start' }); }
    }
  };

  // --- Render Logic ---
  const showLoadingIndicator = isSearching || (isDataLoading && query && !searchResults.length);

  return (
    <div className="search-page-container">
       {/* Navigation Controls */}
       <div className="search-page-nav">
            {/* Always show back button */}
            <button onClick={() => navigate(-1)} className="nav-button back-button" title="Back">
                ←
            </button>
            {/* Always show home button */}
            <Link to="/" className="nav-button home-button" title="Home" aria-label="Go to Home">
                🏠
            </Link>
       </div>

       {/* Search Bar */}
       <SearchBar initialQuery={query}/>

      <h1 className="search-page-title">Search Results</h1>

      {/* Loading / Error States */}
      {showLoadingIndicator && <LoadingSpinner />}
      {!showLoadingIndicator && dataError && <ErrorMessage message={dataError} />}

      <div className="search-status-results">
        {searchError && !isSearching && <p className="search-error">{searchError}</p>}
        {!isSearching && !searchError && !query && !showLoadingIndicator && (
            <p className="search-prompt">Enter a term in the search bar above to find verses.</p>
        )}

        {/* Results List and Pagination */}
        {currentResults.length > 0 && !isSearching && (
          <div className="search-results-container">
            <h2>Results for "{query}" ({totalResults} found):</h2>
            <ul className="search-results-list">
              {currentResults.map((result, index) => (
                <li key={`${result.b}-${result.c}-${result.v}-${index}`} className="search-result-item">
                   <Link
                     to={`/${result.b}/${result.c}/${result.v}`}
                     className="search-result-link"
                     state={{ search: searchParams.toString() }}
                   >
                     <span className="result-location">{result.bookName} {result.c}:{result.v}</span>
                     <p className="result-text">
                        <HighlightText text={result.t} highlight={query} />
                     </p>
                   </Link>
                </li>
              ))}
            </ul>
            <Pagination
                currentPage={validatedCurrentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblings={1}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;