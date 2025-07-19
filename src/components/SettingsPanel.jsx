import React, { useState, useEffect, useRef } from 'react';
import './SettingsPanel.css';

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
          <h3>Settings</h3>
          <p>More settings coming soon!</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;