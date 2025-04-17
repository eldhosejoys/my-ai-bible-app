// src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import BookView from './pages/BookView';
import SearchPage from './pages/SearchPage'; // Import the new Search Page
import './App.css';

function App() {
  return (
      <div className="app-container">
        {/* Consider adding a Layout component here with a persistent SearchBar if needed */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} /> {/* New Search Route */}
          <Route path="/:bookId" element={<BookView />} />
          <Route path="/:bookId/:chapterId" element={<BookView />} />
          <Route path="/:bookId/:chapterId/:verseId" element={<BookView />} />
          <Route path="*" element={ <div style={{textAlign: 'center', marginTop: '50px'}}><h1>404 - Page Not Found</h1><Link to="/">Go Home</Link></div> } />
        </Routes>
      </div>
  );
}

export default App;