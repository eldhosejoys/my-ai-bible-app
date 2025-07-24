import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useBibleData } from '../hooks/useBibleData';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import HighlightText from '../components/HighlightText';
import SettingsPanel from '../components/SettingsPanel';
import BooksDropdown from '../components/BooksDropdown';
import '../pages/SearchPage.css';
import '../components/Pagination.css';

const RESULTS_PER_PAGE = 100;

const SearchPage = () => {
  const {
    bibleData,
    bookTitles,
    isLoading: isDataLoading, // for initial titles/headings
    isBibleLoading,         // for full bible text
    error: dataError,
    loadBibleData             // function to load bible text
  } = useBibleData();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);
  const currentPage = useMemo(() => {
      const page = parseInt(searchParams.get('page') || '1', 10);
      return page > 0 ? page : 1;
  }, [searchParams]);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

    useEffect(() => {
        if (query) {
            document.title = `Search for "${query}" - Malayalam Bible`;
        } else {
            document.title = "Search - Malayalam Bible";
        }

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = `Search the Malayalam Bible for keywords, phrases, and verses. Find what you're looking for quickly and easily.`;
    }, [query]);

  // Effect to trigger data loading if a query is present
  useEffect(() => {
    if (query.trim() && !bibleData) {
      loadBibleData();
    }
  }, [query, bibleData, loadBibleData]);

  // --- Search Execution Logic ---
  const executeSearch = useCallback((term) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm || !bibleData || !bookTitles.length) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError('');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    setTimeout(() => {
        const lowerTerm = trimmedTerm.toLowerCase();
        const results = [];
        try {
            for (const bookId in bibleData) {
                const bookInfo = bookTitles.find(b => b.n.toString() === bookId);
                if (!bookInfo) continue;
                for (const chapterId in bibleData[bookId]) {
                    for (const verse of bibleData[bookId][chapterId]) {
                        if (verse.t && verse.t.toLowerCase().includes(lowerTerm)) {
                            results.push({ b: bookId, c: chapterId, v: verse.v, t: verse.t, bookName: bookInfo.bm });
                        }
                    }
                }
            }
            if (results.length === 0) {
                setSearchError(`No results found for "${trimmedTerm}".`);
            } else {
                setSearchError('');
            }
            setSearchResults(results);
        } catch (err) {
            console.error("Search error:", err);
            setSearchError("An error occurred during the search.");
            setSearchResults([]);
        }
        finally {
            setIsSearching(false);
        }
    }, 50);
  }, [bibleData, bookTitles]);

  // Effect to trigger the search itself when data is ready
  useEffect(() => {
    if (query.trim() && bibleData) {
      executeSearch(query);
    } else if (!query.trim()) {
        setSearchResults([]);
        setSearchError('');
    }
  }, [query, bibleData, executeSearch]);

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
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }
  };

  // --- Render Logic ---
  const showLoadingIndicator = isSearching || isBibleLoading || (isDataLoading && query);

  return (
    <div className="search-page-container">
       <div className="search-page-nav">
            <div className='left-nav'>
                <button onClick={() => navigate(-1)} className="nav-button back-button" title="Back">
                    ←
                </button>
                <Link to="/" className="nav-button home-button" title="Home" aria-label="Go to Home">
                    🏠
                </Link>
            </div>
            <div className="top-right-nav">
                 <BooksDropdown bookTitles={bookTitles} bibleData={bibleData} />
                 <SettingsPanel />
            </div>
       </div>

       <SearchBar initialQuery={query}/>

      <h1 className="search-page-title">Search Results</h1>

      {showLoadingIndicator && <LoadingSpinner />}
      {!showLoadingIndicator && dataError && <ErrorMessage message={dataError} />}

      <div className="search-status-results">
        {searchError && !isSearching && <p className="search-error">{searchError}</p>}
        {!isSearching && !searchError && !query && !showLoadingIndicator && (
            <p className="search-prompt">Enter a term in the search bar above to find verses.</p>
        )}

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
