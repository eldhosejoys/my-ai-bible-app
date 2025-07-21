import React, { useState, useEffect, useRef } from 'react';
import './SettingsPanel.css';
import ClearCacheButton from './settings/ClearCacheButton';
import RefreshDataButton from './settings/RefreshDataButton';
import RandomVerseButton from './settings/RandomVerseButton';
import DarkModeToggle from './settings/DarkModeToggle';
import FontSizeSlider from './settings/FontSizeSlider';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="settings-dropdown-container" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="settings-dropdown-button" title="Settings">
        ⚙️
      </button>

      {isOpen && (
        <div className="settings-panel-card">
          <DarkModeToggle />
          <FontSizeSlider />
          <div className="button-row">
            <ClearCacheButton />
            <RefreshDataButton />
          </div> 
          <RandomVerseButton />
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
