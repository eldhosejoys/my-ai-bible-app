// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import BookView from './pages/BookView';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('darkMode');
    return storedTheme === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/:bookId" element={<BookView />} />
        <Route path="/:bookId/:chapterId" element={<BookView />} />
        <Route path="/:bookId/:chapterId/:verseId" element={<BookView />} />
        <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}><h1>404 - Page Not Found</h1><Link to="/">Go Home</Link></div>} />
      </Routes>
    </div>
  );
}

export default App;
