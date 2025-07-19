import React, { useState, useEffect } from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the stored value from localStorage
    const storedValue = localStorage.getItem('darkMode');
    return storedValue === 'true' || false; // Use stored value or default to false
  });

  useEffect(() => {
    // Update localStorage when darkMode changes
    localStorage.setItem('darkMode', isDarkMode);

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = (e) => {
    e.stopPropagation();
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="dark-mode-toggle" onClick={(e) => e.stopPropagation()}>
      <span className="dark-mode-label">Dark Mode:</span>
      <button className="toggle-button" onClick={toggleDarkMode}>
        <span className={`slider ${isDarkMode ? 'on' : 'off'}`}></span>
      </button>
    </div>
  );
};

export default DarkModeToggle;
