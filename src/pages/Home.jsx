import React from 'react';
import { useBibleData } from '../hooks/useBibleData'; // Hook to fetch book titles
import BookCard from '../components/BookCard';       // Component to display each book
import LoadingSpinner from '../components/LoadingSpinner'; // Loading indicator
import ErrorMessage from '../components/ErrorMessage';   // Error display component
import SearchBar from '../components/SearchBar';       // Search bar component (navigates to /search)
import './Home.css';                                   // Styles for the Home page layout and grid

const Home = () => {
  // Fetch book titles and data loading status/errors
  const { bookTitles, isLoading: isDataLoading, error: dataError } = useBibleData();

  // --- Render Logic ---

  // Show loading spinner only on initial page load if book titles aren't fetched yet
  if (isDataLoading && !bookTitles?.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="home-container">
      {/* Main Title */}
      <h1 className="app-title">മലയാളം ബൈബിൾ</h1>

      {/* --- Search Bar Component --- */}
      {/* This SearchBar component now handles navigation to the /search route */}
      <SearchBar />
      {/* --- End Search Bar --- */}


      {/* --- Status/Error Area (Refresh button moved) --- */}
      <div className="home-status-messages">
         {dataError && <ErrorMessage message={dataError} />}
         {isDataLoading && bookTitles?.length > 0 && <p className="loading-update">Checking for updates...</p>}
      </div>
      {/* --- End Status/Error --- */}


      {/* --- Book Grid Section --- */}
      {/* Removed "Browse Books" H2 title */}
      {bookTitles.length > 0 ? (
          // Display books in a grid if available
          <div className="book-grid">
          {bookTitles.map((book) => (
              <BookCard key={book.n} book={book} />
          ))}
          </div>
      ) : (
          // Show message if no books found and not currently loading data
          !isDataLoading && <p className="no-books-message">No Bible books found.</p>
      )}
      {/* --- End Book Grid Section --- */}


    </div>
  );
};

export default Home;