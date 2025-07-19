import React from 'react';
import { clearDB } from '../../utils/indexedDB';
import './ClearCacheButton.css';

const ClearCacheButton = () => {
  const handleClearCache = async () => {
    try {
      await clearDB();
      alert('Cache cleared successfully!');
    } catch (error) {
      alert('Failed to clear cache.');
      console.error(error);
    }
  };

  return (
    <button onClick={handleClearCache} className="clear-cache-button">
      Clear Cache
    </button>
  );
};

export default ClearCacheButton;
